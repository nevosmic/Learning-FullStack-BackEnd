const fs = require("fs");
const absolutePath = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const HttpError = require("./models/http-error");
const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const { use } = require("./routes/places-routes");

const app = express();

//images middleware - returns all files in /uploads/images if requested
app.use(
  "/uploads/images",
  express.static(absolutePath.join("uploads", "images"))
);

app.use(bodyParser.json());
/*CORS error : resources on a server can only be requested by requests that are coming from the same server
The browser sees that here we are trying to send a request from localhost 3000 to localhost 5000 two DIFFERENT domains - Frontend error
to solve it-the server has to attach header to the response it send back to the client that allow the client to access the resources - than the browser see these headers and doesnt throw this error */

//add a middleware to solve the CORS error
app.use((req, res, next) => {
  //add response headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE");
  // res.setHeader("access-control-max-age", "10"); // Seconds.

  next(); //let the request continue to other middlewares
});

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
  if (req.file) {
    //delete image file (signup error)
    fs.unlink(req.file.path, (err) => {
      console.log("err image delete:", err);
    });
  }
  //response has already been sent
  if (res.hedearSent) {
    return next(error); //forward the error
  }
  //500 - indicates that something went wrong on the server
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred! " });
});

//jQnMh5t5O3QpGhDN
//connection to Mongoose
mongoose
  .connect(
    "mongodb+srv://Nevo:jQnMh5t5O3QpGhDN@cluster1.rmijn4a.mongodb.net/mern?retryWrites=true&w=majority"
  )
  .then(() => {
    // if the connection was succesful we start our backend server
    app.listen(5000);
  })
  .catch((err) => {
    console.log("err:", err);
  });
