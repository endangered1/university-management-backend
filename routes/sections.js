const express = require("express");
const passport = require("passport");
const authorize = require("../middleware/authorize");
const { Section } = require("../models/sections");
const { Course } = require("../models/courses");
const { User } = require("../models/user");
const { Enrollment } = require("../models/enrollments");

const mongoose = require("mongoose");

const router = express.Router();

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  authorize("admin"),
  async (req, res) => {
    try {
      const { course, instructor, sectionName, semester, capacity } = req.body;

      if (!course || !instructor || !sectionName || !semester || capacity == null)
        return res.status(400).send("All fields are required.");

      const existingCourse = await Course.findById(course);
      if (!existingCourse)
        return res.status(400).send("Invalid course.");

      const existingInstructor = await User.findById(instructor);
      if (!existingInstructor)
        return res.status(400).send("Invalid instructor.");

      const existingSection = await Section.findOne({ course, semester, sectionName });
      if (existingSection)
        return res.status(400).send("Section already exists for this course.");

      const section = new Section({
        course,
        instructor,
        sectionName,
        semester,
        capacity
      });

      await section.save();

      return res.status(201).send(section);
    } catch (err) {
      console.log(err);
      return res.status(500).send("Something went wrong.");
    }
  }
);

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const sections = await Section.find()
        .populate("course", "code title")
        .populate("instructor", "name email")
        .sort({ createdAt: -1 });

      return res.send(sections);
    } catch (err) {
      console.log(err);
      return res.status(500).send("Something went wrong.");
    }
  }
);

router.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  authorize("instructor"),
  async (req, res) => {
    try {
      const sections = await Section.find({ instructor: req.user._id })
        .populate("course", "code title")
        .populate("instructor", "name email"); // optional (can remove)

      return res.send(sections);
    } catch (ex) {
      return res.status(500).send("Something failed.");
    }
  }
);

router.get(
  "/:id/enrollments",
  passport.authenticate("jwt", { session: false }),
  authorize("instructor"),
  async (req, res) => {
    try {
      const sectionId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(sectionId))
        return res.status(400).send("Invalid section id.");

      const section = await Section.findOne({
        _id: sectionId,
        instructor: req.user._id
      }).populate("course", "code title");

      if (!section) return res.status(404).send("Section not found.");

      const enrollments = await Enrollment.find({ section: sectionId })
        .populate("student", "name email")
        .sort({ createdAt: -1 });

      return res.send({
        section,
        count: enrollments.length,
        enrollments
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send("Something went wrong.");
    }
  }
);

router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  authorize("admin"),
  async (req, res) => {
    try {
      const { course, instructor, sectionName, semester, capacity } = req.body;

      if (!course || !instructor || !sectionName || !semester || capacity == null)
        return res.status(400).send("All fields are required.");

      if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(400).send("Invalid section id.");

      const existingSection = await Section.findById(req.params.id);
      if (!existingSection)
        return res.status(404).send("Section not found.");

      const existingCourse = await Course.findById(course);
      if (!existingCourse)
        return res.status(400).send("Invalid course.");

      const existingInstructor = await User.findById(instructor);
      if (!existingInstructor || existingInstructor.role !== "instructor")
        return res.status(400).send("Invalid instructor.");

      // Prevent duplicate section
      const duplicate = await Section.findOne({
        _id: { $ne: req.params.id },
        course,
        semester,
        sectionName
      });

      if (duplicate)
        return res.status(400).send("Section already exists for this course.");

      // Prevent lowering capacity below enrolled count
      const enrollmentCount = await Enrollment.countDocuments({
        section: req.params.id
      });

      if (capacity < enrollmentCount)
        return res.status(400).send(
          `Capacity cannot be less than current enrolled students (${enrollmentCount}).`
        );

      const updatedSection = await Section.findByIdAndUpdate(
        req.params.id,
        { course, instructor, sectionName, semester, capacity },
        { new: true, runValidators: true }
      );

      return res.send(updatedSection);
    } catch (err) {
      console.log(err);
      return res.status(500).send("Something wnt wrong");
    }
  }
);

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  authorize("admin"),
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(400).send("invalid section id.");

      const section = await Section.findById(req.params.id);
      if (!section)
        return res.status(404).send("section not found.");

      const enrollmentCount = await Enrollment.countDocuments({
        section: req.params.id
      });

      if (enrollmentCount > 0)
        return res.status(400).send(
          "cannot delete section with existing enrollments."
        );

      await section.deleteOne();
      
      return res.send(section);
    } catch (err) {
      console.log(err);
      return res.status(500).send("something went wrong");
    }
  }
);

module.exports = router;