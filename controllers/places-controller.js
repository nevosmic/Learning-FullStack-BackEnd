//const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const PlaceModule = require("../models/place");
const UserModule = require("../models/user");
const mongoose = require("mongoose");

/*a controller file contains all middleware functions */

const getPlaceById = async (req, res, next) => {
  console.log("GET place");
  const placeId = req.params.pid; //the id encoded in the url
  let place;
  try {
    place = await PlaceModule.findById(placeId);
  } catch (err) {
    // get request generaly has a problem
    const error = new HttpError("Could not find the place.", 500);
    return next(error);
  }

  if (!place) {
    // request is fine but we just dont have this place id in our database
    //triger the error handler middleware
    const error = new HttpError(
      "Could not find a place for the provided id.",
      404
    );
    return next(error);
  }
  //sending a response in a json format
  res.json({ place: place.toObject({ getters: true }) }); //getters add id property
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  console.log(userId);
  let userPlaces;
  try {
    //populate- access to the places in user collection by userId
    userPlaces = await (await UserModule.findById(userId)).populate("places");
    //
  } catch (err) {
    // get request generaly has a problem
    console.log("err:", err);
    const error = new HttpError("Could not find this user place.", 500);
    return next(error);
  }
  //if (userPlaces.length === 0) {
  if (!userPlaces || userPlaces.places.length === 0) {
    next(new HttpError("Could not find places for the provided user id.", 404)); //will reach the next error middleware in line
  } else {
    res.json({
      places: userPlaces.places.map((place) =>
        place.toObject({ getters: true })
      ),
    });
  }
};

const createPlace = async (req, res, next) => {
  console.log("ADD PLACE");

  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    //We do have errors
    // console.log(erros.array());
    const invalidParam = erros.array()[0].param;
    //when working with async code throw will not work
    next(
      new HttpError(`Invalid  ${invalidParam} , please check your data`, 422)
    );
  }
  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }
  const createdPlace = new PlaceModule({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator,
  });

  //check if the user id exist already (signed up)
  let user;
  try {
    user = await UserModule.findById(creator);
  } catch (err) {
    const error = new HttpError("Creating place failed, please try again", 500);
    return next(error);
  }

  //if user is not if our data base
  if (!user) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }

  console.log(user);

  //insert to database
  try {
    //Transaction- a way to execute a group of operations as a unit.
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess }); //unique id automatically created
    //add only *place id* to the user with mongoose method push
    user.places.push(createdPlace);
    // store updated user
    await user.save({ session: sess });
    //changes are saved only at this point- once all the tasks are succesful
    await sess.commitTransaction();
  } catch (err) {
    //data validation fail/ data server is down
    console.log("err:", err);
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );
    return next(error); // if we just throw an error the code execution will continue
  }
  res.status(201).json({ place: createdPlace });
};

const deletePlace = async (req, res, next) => {
  console.log("DELETE");
  const placeId = req.params.pid;
  console.log("placeId: ", placeId);
  // find place and find this placeID in the user places so we can delete
  let place;
  try {
    //populate- access to the user in users collection by the id 'creator'
    place = await (await PlaceModule.findById(placeId)).populate("creator");
  } catch (err) {
    const error = new HttpError("Could not delete place.", 500);
    return next(error);
  }

  //check if the place id exist
  if (!place) {
    const error = new HttpError("Could not find place for this id.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    //remove only *place id* from user's places with mongoose method pull
    place.creator.places.pull(place);
    //store updated user (the place was deleted)
    await place.creator.save({ session: sess });
    //changes are saved only at this point- once all the tasks are succesful
    await sess.commitTransaction();
  } catch (err) {
    console.log("err:", err);
    const error = new HttpError("Could not delete place.", 500);
    return next(error);
  }

  res.status(200).json({ message: "Deleted place", place }); // => {place:place}
};

const updatePlace = async (req, res, next) => {
  console.log("UPDATE");
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    //We do have errors
    const invalidParam = erros.array()[0].param;
    throw new HttpError(
      `Invalid  ${invalidParam} , please check your data`,
      422
    );
  }
  const placeId = req.params.pid;
  const { title, description } = req.body;
  let place;
  try {
    place = await PlaceModule.findById(placeId);
  } catch (err) {
    const error = new HttpError("Could not update place.", 500);
    return next(error);
  }

  place.title = title;
  place.description = description;

  //store updated place in database
  try {
    await place.save();
  } catch (err) {
    const error = new HttpError("Could not update place.", 500);
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.deletePlace = deletePlace;
exports.updatePlace = updatePlace;
