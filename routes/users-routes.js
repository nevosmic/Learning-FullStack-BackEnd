const express = require("express");
const { check } = require("express-validator"); //validation function

const usersController = require("../controllers/users-controller");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.get("/", usersController.getUsers);

router.post(
  "/signup",
  fileUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersController.signup
);

/* search a user with the input email and comparing password do no need for validation */
router.post("/login", usersController.login);

module.exports = router;
