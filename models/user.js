const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // speeds up the querying process
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  places: { type: String, required: true }, // later we will store the id's of the places of this user
});

// only create a new user if the email doesn't exist already
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
