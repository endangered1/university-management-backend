const express = require("express");
const passport = require("passport");
const authorize = require("../middleware/authorize");
const { Department } = require("../models/department");
const { Course } = require("../models/courses");

const router = express.Router();

router.post(
    "/",
    passport.authenticate("jwt", { session: false}),
    authorize("admin"),
    async (req, res) => {
        try {
            if (!req.body.name)
                return res.status(400).send("Department name is required.");

            const existing = await Department.findOne({ name: req.body.name});
            if (existing)
                return res.status(400).send("Department already exists");
            
            const department = new Department({
            name: req.body.name
        });
        
        await department.save();

        res.status(201).send(department);
      } catch (err) {
        console.log(err);
        res.status(500).send("Something went wrong");
        }
    }
);

router.get(
    "/",
    passport.authenticate("jwt", {session: false}),
    async (req, res) => {
        try {
            const departments = await Department.find().sort("name");
            res.send(departments);
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
      if (!req.body.name) return res.status(400).send("Department name is required.");

      const existing = await Department.findOne({
        name: new RegExp(`^${req.body.name}$`, "i"),
        _id: { $ne: req.params.id }
      });
      if (existing) return res.status(400).send("Department already exists.");

      const department = await Department.findByIdAndUpdate(
        req.params.id,
        { name: req.body.name },
        { new: true, runValidators: true }
      );

      if (!department) return res.status(404).send("Department not found.");
      res.send(department);
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
      const department = await Department.findById(req.params.id);
      if (!department) return res.status(404).send("Department not found.");

      const courseCount = await Course.countDocuments({ department: req.params.id });
      if (courseCount > 0) return res.status(400).send("Cannot delete department with existing courses.");

      await department.deleteOne();
      res.send(department);
    } catch (err) {
      res.status(500).send("Something failed.");
    }
  }
);


module.exports = router;