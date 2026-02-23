const express = require("express");
const passport = require("passport");
const authorize = require("../middleware/authorize");
const { Course } = require("../models/courses");
const { Department } = require("../models/department");

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

module.exports = router;