const express = require("express");
const bcrypt = require("bcrypt");
const { User } = require("../models/user");
const passport = require("passport");
const authorize = require("../middleware/authorize");
const mongoose = require("mongoose");

const router = express.Router();

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  authorize("admin"),
  async (req, res) => {
    try {
      const page = Math.max(parseInt(req.query.page || "1", 10), 1);
      const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);

      const filter = {};

      if (req.query.role) filter.role = String(req.query.role).trim();

      const q = String(req.query.q || "").trim();
      if (q) {
        filter.$or = [
          { name: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } }
        ];
      }

      const total = await User.countDocuments(filter);

      const users = await User.find(filter)
        .select("-password")
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit);

      return res.send({
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        data: users
      });
    } catch (ex) {
      return res.status(500).send("Something failed.");
    }
  }
);

router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  authorize("admin"),
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(400).send("Invalid user id.");

      const user = await User.findById(req.params.id).select("-password");
      if (!user) return res.status(404).send("User not found.");

      return res.send(user);
    } catch (ex) {
      return res.status(500).send("Something failed.");
    }
  }
);

router.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      return res.send(req.user);
    } catch (ex) {
      return res.status(500).send("Something failed.");
    }
  }
);

router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  authorize("admin"),
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(400).send("Invalid user id.");

      if (req.body.password !== undefined)
        return res.status(400).send("Password cannot be updated here.");

      const updates = {};

      if (req.body.name !== undefined) updates.name = String(req.body.name).trim();
      if (req.body.email !== undefined) updates.email = String(req.body.email).trim().toLowerCase();
      if (req.body.role !== undefined) updates.role = String(req.body.role).trim();

      if (updates.name !== undefined && updates.name.length < 2)
        return res.status(400).send("Name must be at least 2 characters.");

      if (updates.role !== undefined) {
        const allowedRoles = ["student", "instructor", "admin"];
        if (!allowedRoles.includes(updates.role))
          return res.status(400).send("Invalid role.");
      }

      if (updates.email !== undefined) {
        if (updates.email.length < 5)
          return res.status(400).send("Email is invalid.");

        const existing = await User.findOne({
          email: updates.email,
          _id: { $ne: req.params.id }
        });

        if (existing) return res.status(400).send("Email already in use.");
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true }
      ).select("-password");

      if (!user) return res.status(404).send("User not found.");

      return res.send(user);
    } catch (ex) {
      return res.status(500).send("Something failed.");
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
        return res.status(400).send("Invalid user id.");

      if (req.user._id.toString() === req.params.id)
        return res.status(400).send("You cannot delete your own account.");

      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).send("User not found.");

      await User.deleteOne({ _id: req.params.id });

      return res.send("User deleted.");
    } catch (ex) {
      return res.status(500).send("Something failed.");
    }
  }
);

router.get(
  "/whoami",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      return res.send({
        _id: req.user._id,
        email: req.user.email,
        role: req.user.role
      });
    } catch (ex) {
      return res.status(500).send("Something failed.");
    }
  }
);

module.exports = router;
