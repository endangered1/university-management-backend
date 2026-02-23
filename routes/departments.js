const express = require("express");
const passport = require("passport");
const authorize = require("../middleware/authorize");
const { Department } = require("../models/department");

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


module.exports = router;