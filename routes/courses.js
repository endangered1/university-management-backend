const express = require("express");
const passport = require("passport");
const authorize = require("../middleware/authorize");
const { Course } = require("../models/courses");
const { Department } = require("../models/department");
const { Section } = require("../models/sections");

const router = express.Router();

router.post(
    "/",
    passport.authenticate("jwt", {session: false}),
    authorize("admin"),
    async (req, res) => {
        try {
            const { department, code, title, creditHours } = req.body;

            if(!department || !code || !title || creditHours == null)
                return res.status(400).send("All fields are required.");

            const dept = await Department.findById(department);
            if(!dept)
                return res.status(400).send("Invalid department");

            const existing = await Course.findOne({ department, code});
            if(existing)
                return res.status(400).send("Course already exists in this department.");

            const course = new Course({
                department,
                code,
                title,
                creditHours
            });

            await course.save();

            return res.status(201).send(course);
          } catch (err) {
            console.log(err);
            res.status(500).send("Something went wrong.");
        }
    }
);

router.get(
    "/",
    passport.authenticate("jwt", {session: false}),
    async (req, res) => {
        try {
            const courses = await Course.find()
            .populate("department", "name")
            .sort({ createdAt: -1});

            res.send(courses);
          } catch (err) {
            console.log(err);
            res.status(500).send("Something went wrong");
        }
    }
);

router.put(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    authorize("admin"),
    async (req, res) => {
        try {
            const { department, code, title, creditHours } = req.body;

      if (!department)
        return res.status(400).send("Department is required.");
      if (!code)
        return res.status(400).send("Course code is required.");
      if (!title)
        return res.status(400).send("Course title is required.");

      const dep = await Department.findById(department);
      if (!dep)
        return res.status(400).send("Invalid department.");

      const duplicate = await Course.findOne({
        department,
        code,
        _id: { $ne: req.params.id }
      });

      if (duplicate)
        return res
          .status(400)
          .send("Course with same code already exists in this department.");

      const course = await Course.findByIdAndUpdate(
        req.params.id,
        { department, code, title, creditHours },
        { new: true, runValidators: true }
      );

      if (!course)
        return res.status(404).send("Course not found.");

      res.send(course);
    } catch (err) {
      res.status(500).send("Something failed.");
        }
    }
);

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  authorize("admin"),
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);
      if (!course)
        return res.status(404).send("Course not found.");

      const sectionCount = await Section.countDocuments({
        course: req.params.id
      });

      if (sectionCount > 0)
        return res
          .status(400)
          .send("Cannot delete course with existing sections.");

      await course.deleteOne();

      res.send(course);
    } catch (err) {
      res.status(500).send("Something failed.");
    }
  }
);

module.exports = router;