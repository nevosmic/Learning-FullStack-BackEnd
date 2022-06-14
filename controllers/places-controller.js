const { v4: uuidv4 } = require("uuid");
const HttpError = require("../models/http-error");

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
const getPlaceById = (req, res, next) => {
  //the id encoded in the url
  const placeId = req.params.pid;
  console.log("GET request in places");
  const place = Dummy_Places.find((p) => {
    return p.id === placeId;
  });

  if (!place) {
    //triger the error handler middleware
    throw new HttpError("Could not find a place for the provided id.", 404);
  }
  //sending a response in a json format
  res.json({ place }); // => {place:place}
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  console.log(userId);
  const userPlaces = Dummy_Places.filter((p) => {
    return p.creator === userId;
  });
  //if (userPlaces.length === 0) {
  if (!userPlaces || userPlaces.length === 0) {
    next(
      new HttpError("Could not find a places for the provided user id.", 404)
    ); //will reach the next error middleware in line
  } else {
    res.json({ userPlaces });
  }
};
//TODO : validation on body data
const createPlace = (req, res, next) => {
  console.log("POST request ADD PLACE");
  const { title, description, coordinates, address, creator } = req.body;
  const createdPlace = {
    id: uuidv4(),
    title,
    description,
    location: coordinates,
    address,
    creator,
  };
  Dummy_Places.push(createdPlace); // unshift instead of push adds to the first place
  res.status(201).json({ place: createdPlace });
};

const deletePlace = (req, res, next) => {
  console.log("DELETE");
  const placeId = req.params.pid;
  const place = Dummy_Places.find((p) => {
    return p.id === placeId;
  });

  if (!place) {
    //triger the error handler middleware
    throw new HttpError("Could not find a place for the provided id.", 404);
  }
  Dummy_Places = Dummy_Places.filter((p) => {
    return p.id != placeId;
  });

  //sending a response in a json format
  res.status(200).json({ message: "Deleted place", place }); // => {place:place}
};

const updatePlace = (req, res, next) => {
  console.log("UPDATE");
  const placeId = req.params.pid;
  const { title, description } = req.body;

  const updatedPlace = { ...Dummy_Places.find((p) => p.id === placeId) }; //  creates a new array

  const placeIndex = Dummy_Places.findIndex((p) => p.id === placeId);
  console.log(placeIndex);
  updatedPlace.title = title;
  updatedPlace.description = description;
  Dummy_Places[placeIndex] = updatedPlace;

  res.status(200).json({ place: updatedPlace });
};
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.deletePlace = deletePlace;
exports.updatePlace = updatePlace;
