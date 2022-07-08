const express = require("express");
const { check } = require("express-validator");
const placesControllers = require("../controllers/places-controller");
const fileUpload = require("../middleware/file-upload");
const checkToken = require("../middleware/check-token");

const router = express.Router();

//:pid is a dynamic encoded id
router.get("/:pid", placesControllers.getPlaceById);

router.get("/user/:uid", placesControllers.getPlacesByUserId);

/*All these routers [create,update,delete] should be protected:
 no request without a valid token should 
 reach them.

 I will do that with a middleware that checks incoming requests for a valid token
 not valid-> block the req from continue to other middleware*/
router.use(checkToken);

// CREATE PLACE
router.post(
  "/",
  fileUpload.single("image"),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placesControllers.createPlace
);

// UPDATE PLACE
router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placesControllers.updatePlace
);

// DELETE PLACE
router.delete("/:pid", placesControllers.deletePlace);

module.exports = router;
