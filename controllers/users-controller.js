const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const UserModule = require("../models/user");

const Dummy_Users = [
  { id: "u1", name: "Max Schwarz", email: "max@gmail.com", password: 12345 },
  { id: "u2", name: "Aviv Yaniv", email: "Aviv@gmail.com", password: 55555 },
];

const getUsers = async (req, res, next) => {
  console.log("GET USERS");
  let users;
  try {
    users = await UserModule.find({}, "-password"); // we dont want to return passwords!
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again.",
      500
    );
    return next(error);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};
const signup = async (req, res, next) => {
  console.log("SIGNUP");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // We have errors
    // console.log(erros.array());
    const invalidParam = errors.array()[0].param;
    const error = new HttpError(
      `Invalid  ${invalidParam} , please check your data`,
      422
    );
    return next(error);
  }

  const { name, email, password, places } = req.body;
  // Check if this user already exist
  let existingUser;
  try {
    existingUser = await UserModule.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again.", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "User already exist, please login instead.",
      422
    );
    return next(error);
  }
  const newUser = new UserModule({
    name,
    email,
    image:
      "https://cdn.britannica.com/43/93843-050-A1F1B668/White-House-Washington-DC.jpg",
    password,
    places,
  });

  //store user in database
  try {
    await newUser.save();
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json({ user: newUser.toObject({ getters: true }) });
};
const login = async (req, res, next) => {
  console.log("LOGIN");
  const { email, password } = req.body;

  let user;
  try {
    user = await UserModule.findOne({ email: email });
  } catch (errr) {
    const error = new HttpError("Logging in failed, please try again.", 500);
    return next(error);
  }

  if (!user || user.password !== password) {
    return next(
      new HttpError(
        "Could not identify user, credentials seem to be wrong",
        401
      )
    );
  }
  res.json({ message: "Logged in!" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
