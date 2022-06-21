const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const HttpError = require("./models/http-error");
const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");

const app = express();

app.use(bodyParser.json());

//register the middleware
app.use("/api/places", placesRoutes); //express will only forward requests with path starts with /api/places
app.use("/api/users", usersRoutes); //express will only forward requests with path starts with /api/users

// this middleware is only reached if there is a request that didnt get a response before -> a request that we dont want to handle
app.use((req, re, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error; //call deafult error handler
});

// deafult error handler middleware
app.use((error, req, res, next) => {
  //response has already been sent
  if (res.hedearSent) {
    return next(error); //forward the error
  }
  res.status(error.code || 500); //500 - indicates that something went wrong on the server
  res.json({ message: error.message || "An unknown error occurred! " });
});

//jQnMh5t5O3QpGhDN
mongoose
  .connect(
    "mongodb+srv://Nevo:jQnMh5t5O3QpGhDN@cluster1.rmijn4a.mongodb.net/places?retryWrites=true&w=majority"
  )
  .then(() => {
    // if the connection was succesful we start our backend server
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });
