const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const passport = require("passport");

const users = require("./routes/users");
const auth = require("./routes/auth");

const app = express();
app.use(express.json());

if (!config.get("jwtPrivateKey")) {
  console.error("FATAL ERROR: jwtPrivateKey is not defined");
  process.exit(1);
}

app.use(passport.initialize());
require("./middleware/passport")();

mongoose
   .connect("mongodb://127.0.0.1/university_system")
   .then(() => console.log("Connected to MongoDB..."))
   .catch((err) =>console.error("Couldnt connect to MongoDB...", err.message));

app.get("/", (req,res) => res.send("UMS API running..."));

app.use("/api/users", users);
app.use("/api/auth", auth);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on the port ${port}...`));