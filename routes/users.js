const express = require("express");
const bcrypt = require("bcrypt");
const { User } = require("../models/user");
const passport = require("passport");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.post("/", async (req, res) => {
  if (!req.body.name) return res.status(400).send("Name is required.");
  if (!req.body.email) return res.status(400).send("Email is required.");
  if (!req.body.password) return res.status(400).send("Password is required.");
  if (!req.body.role) return res.status(400).send("Role is required.");

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role
  });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  res.send({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  });
});

router.get(
  "/",
  passport.authenticate("jwt", { session:false}),
  authorize("admin"),
  async (req, res) => {
  const users = await User.find().select("-password");
  res.send(users);
  }
);

router.get(
  "/me",
  passport.authenticate("jwt", {session: false}),
  (req,res) => {
  res.send(req.user);
  }
);

router.get(
  "/whoami",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.send({
      _id: req.user._id,
      email: req.user.email,
      role: req.user.role
    });
  }
);

module.exports = router;
