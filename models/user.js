const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // speeds up the querying process
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  // one user can have multiple places - so we use array here
  // ref attribute - connect the user schema to place schema
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: "Place" }],
});

// only create a new user if the email doesn't exist already
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
