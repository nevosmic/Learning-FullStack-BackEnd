const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const PlaceModule = require("../models/place");
/*a controller file contains all middleware functions */

let Dummy_Places = [
  {
    id: "p1",
    title: "Emp. State Building 111",
    description: "One of the most famous sky scrapers in the world!",
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    address: "20 W 34th St, New York, NY 10001",
    creator: "u1",
  },
  {
    id: "p2",
    title: "Emp. State Building 222",
    description: "One of the most famous sky scrapers in the world!",
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    address: "20 W 34th St, New York, NY 10001",
    creator: "u1",
  },
  {
    id: "p3",
    title: "Emp. State Building 333 ",
    description: "One of the most famous sky scrapers in the world!",
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    address: "20 W 34th St, New York, NY 10001",
    creator: "u2",
  },
];
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
    userPlaces = await PlaceModule.find({ creator: userId });
  } catch (err) {
    // get request generaly has a problem
    const error = new HttpError("Could not find this user place.", 500);
    return next(error);
  }
  //if (userPlaces.length === 0) {
  if (!userPlaces || userPlaces.length === 0) {
    next(
      new HttpError("Could not find a places for the provided user id.", 404)
    ); //will reach the next error middleware in line
  } else {
    res.json({
      places: userPlaces.map((place) => place.toObject({ getters: true })),
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
    image:
      "https://www.thetrainline.com/cms/media/1360/france-eiffel-tower-paris.jpg?mode=crop&width=1080&height=1080&quality=70",
    creator,
  });

  //insert to database
  try {
    await createdPlace.save();
  } catch (err) {
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
  let place;
  try {
    place = await PlaceModule.findById(placeId);
  } catch (err) {
    const error = new HttpError("Could not delete place.", 500);
    return next(error);
  }

  try {
    await place.remove();
  } catch (err) {
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
