const express = require("express");
const { check } = require("express-validator"); //validation function
const usersControllers = require("../controllers/users-controller");
const router = express.Router();

router.get("/", usersControllers.getUsers);

router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersControllers.signup
);

/* search a user with the input email and comparing password do no need for validation */
router.post("/login", usersControllers.login);

module.exports = router;
