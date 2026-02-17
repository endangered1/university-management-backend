const { User } = require("./models/user");

const user = new User({ role: "admin" });
const token = user.generateAuthToken();

console.log(token);