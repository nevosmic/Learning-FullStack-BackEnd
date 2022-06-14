const { v4: uuidv4 } = require("uuid");
const HttpError = require("../models/http-error");

const Dummy_Users = [
  { id: "u1", name: "Max Schwarz", email: "max@gmail.com", password: 12345 },
  { id: "u2", name: "Aviv Yaniv", email: "Aviv@gmail.com", password: 55555 },
];

const getUsers = (req, res, next) => {
  console.log("GET USERS");
  const usersList = Dummy_Users.map((u) => {
    return u.name;
  });
  res.json({ message: usersList });
};
const signup = (req, res, next) => {
  console.log("SIGNUP");
  const { name, email, password } = req.body;
  // Check if this user already exist
  const hasUser = Dummy_Users.find((u) => u.email === email);
  if (hasUser) {
    throw new HttpError("Could not create user, email already exist.", 422);
  }
  const newUser = {
    id: uuidv4(),
    name,
    email,
    password,
  };
  Dummy_Users.push(newUser);
  res.status(201).json({ user: newUser });
};
const login = (req, res, next) => {
  console.log("LOGIN");
  const { email, password } = req.body;
  const identifiedUser = Dummy_Users.find((u) => {
    return u.email === email;
  });
  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError(
      "Could not identify user, credentials seem to be wrong",
      401
    );
  }
  res.json({ message: "Logged in!" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
