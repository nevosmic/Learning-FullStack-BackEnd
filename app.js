const express = require("express");
const bodyParser = require("body-parser");

//middleware
const placesRoutes = require("./routes/places-routes");

const app = express();
app.use(bodyParser.json());

//register the middleware
app.use("/api/places", placesRoutes); //express will only forward requests with path starts with /api/places

// deafult error handler middleware
app.use((error, req, res, next) => {
  //response has already been sent
  if (res.hedearSent) {
    return next(error); //forward the error
  }
  res.status(error.code || 500); //500 - indicates that something went wrong on the server
  res.json({ message: error.message || "An unknown error occurred! " });
});
app.listen(5000);
