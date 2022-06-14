const express = require("express");
const placesControllers = require("../controllers/places-controller");
const router = express.Router();

//:pid is a dynamic encoded id
router.get("/:pid", placesControllers.getPlaceById);

router.get("/user/:uid", placesControllers.getPlacesByUserId);

module.exports = router;
