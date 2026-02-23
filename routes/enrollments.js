const express = require("express");
const passport = require("passport");
const authorize = require("../middleware/authorize");
const { Enrollment } = require("../models/enrollments");
const { Section } = require("../models/sections");
const mongoose  = require("mongoose");

const router = express.Router();

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  authorize("student"),
  async (req, res) => {
    try {
      const { section } = req.body;

      if (!section)
        return res.status(400).send("Section is required.");

      const existingSection = await Section.findById(section);
      if (!existingSection)
        return res.status(400).send("Invalid section.");

      const enrolledCount = await Enrollment.countDocuments({ section });

      if (enrolledCount >= existingSection.capacity)
        return res.status(400).send("Section is full.");

      const existingEnrollment = await Enrollment.findOne({
        student: req.user._id,
        section
      });

      if (existingEnrollment)
        return res.status(400).send("Already enrolled in this section.");

      const enrollment = new Enrollment({
        student: req.user._id,
        section
      });

      await enrollment.save();

      return res.status(201).send(enrollment);
    } catch (err) {
      console.log(err);
      return res.status(500).send("Something went wrong.");
    }
  }
);

router.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  authorize("student"),
  async (req, res) => {
    try {
      const enrollments = await Enrollment.find({ student: req.user._id })
        .populate({
          path: "section",
          populate: [
            { path: "course", select: "code title" },
            { path: "instructor", select: "name email" }
          ]
        })
        .sort({ createdAt: -1 });

      return res.send(enrollments);
    } catch (err) {
      console.log(err);
      return res.status(500).send("Something went wrong.");
    }
  }
);

router.delete(
  "/:sectionId",
  passport.authenticate("jwt", { session: false }),
  authorize("student"),
  async (req, res) => {
    try {
      const enrollment = await Enrollment.findOneAndDelete({
        student: req.user._id,
        section: req.params.sectionId
      });

      if (!enrollment)
        return res.status(404).send("Enrollment not found.");

      return res.send(enrollment);
    } catch (err) {
      console.log(err);
      return res.status(500).send("Something went wrong.");
    }
  }
);

router.put(
  "/:enrollmentId/grade",
  passport.authenticate("jwt", { session: false }),
  authorize("instructor"),
  async (req, res) => {
    try {
      const { grade } = req.body;

        if (!mongoose.Types.ObjectId.isValid(req.params.enrollmentId))
        return res.status(400).send("Invalid enrollment id.");

      if (!grade)
        return res.status(400).send("Grade is required.");

      const enrollment = await Enrollment.findById(req.params.enrollmentId);
      if (!enrollment)
        return res.status(404).send("Enrollment not found.");

      const section = await Section.findById(enrollment.section);
      if (!section)
        return res.status(400).send("Invalid section.");

      if (section.instructor.toString() !== req.user._id.toString())
        return res.status(403).send("Access denied. Forbidden.");

        enrollment.grade = grade;
      await enrollment.save();

      return res.send(enrollment);
    } catch (err) {
      console.log(err);
      return res.status(500).send("Something went wrong.");
    }
  }
);

module.exports = router;