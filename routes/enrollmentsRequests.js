const express = require("express");
const passport = require("passport");
const mongoose  = require("mongoose");
const authorize = require("../middleware/authorize");
const { EnrollmentRequest } = require("../models/enrollmentRequest");
const { Course } = require("../models/courses");
const { Section } = require("../models/sections")
const { Enrollment } = require("../models/enrollments")


const router = express.Router();

router.post(
    "/",
  passport.authenticate("jwt", { session: false }),
  authorize("student"),
  async (req, res) => {
    try {
      const { course, semester, preferredSectionName, note } = req.body;

      if (!course) return res.status(400).send("Course is required.");
      if (!semester) return res.status(400).send("Semester is required.");

      if (!mongoose.Types.ObjectId.isValid(course))
        return res.status(400).send("Invalid course id.");

      const existingCourse = await Course.findById(course);
      if (!existingCourse) return res.status(404).send("Course not found.");

      const request = new EnrollmentRequest({
        student: req.user._id,
        course,
        semester,
        note
      });

      await request.save();

      return res.status(201).send(request);
    } catch (err) {
      console.log(err);
      if (err.code === 11000) return res.status(400).send("Request already submitted.");
      return res.status(500).send("Something went wrong.");
    }
  }  
);

router.put(
  "/:requestId/approve",
  passport.authenticate("jwt", { session: false }),
  authorize("admin"),
  async (req, res) => {
    try {
      const { requestId } = req.params;
      const { section, decisionNote } = req.body;

      if (!mongoose.Types.ObjectId.isValid(requestId))
        return res.status(400).send("Invalid request id.");

      if (!section) return res.status(400).send("Section is required.");
      if (!mongoose.Types.ObjectId.isValid(section))
        return res.status(400).send("Invalid section id.");

      const request = await EnrollmentRequest.findById(requestId);
      if (!request) return res.status(404).send("Request not found.");

      if (request.status !== "pending")
        return res.status(400).send("Only pending requests can be approved.");

      const existingSection = await Section.findById(section);
      if (!existingSection) return res.status(404).send("Section not found.");

      if (String(existingSection.course) !== String(request.course))
        return res.status(400).send("Section course does not match request course.");

      if (String(existingSection.semester) !== String(request.semester))
        return res.status(400).send("Section semester does not match request semester.");

      const now = new Date();
      if (now <= new Date(existingSection.enrollmentDeadline))
        return res.status(400).send("Cannot allot before the enrollment deadline ends.");

      const enrolledCount = await Enrollment.countDocuments({
        section: existingSection._id
      });

      if (enrolledCount >= existingSection.capacity)
        return res.status(400).send("Section is full.");

      // (Recommended) Prevent enrolling the student twice for same course+semester
      const sectionIds = await Section.find({
        course: request.course,
        semester: request.semester
      }).distinct("_id");

      const alreadyEnrolledInCourseSemester = await Enrollment.findOne({
        student: request.student,
        section: { $in: sectionIds }
      });

      if (alreadyEnrolledInCourseSemester)
        return res
          .status(400)
          .send("Student is already enrolled in this course for this semester.");

      const enrollment = new Enrollment({
        student: request.student,
        section: existingSection._id
      });

      await enrollment.save();

      request.status = "approved";
      request.decidedSection = existingSection._id;

      if (typeof decisionNote === "string" && decisionNote.trim())
        request.decisionNote = decisionNote.trim();

      await request.save();

      return res.send({
        message: "Approved. Enrollment created.",
        request,
        enrollment
      });
    } catch (err) {
      console.log(err);

      // Handles Enrollment unique index (student+section) collisions nicely
      if (err.code === 11000)
        return res.status(400).send("Duplicate enrollment detected.");

      return res.status(500).send("Something went wrong");
     }
  }
); 

module.exports = router;
