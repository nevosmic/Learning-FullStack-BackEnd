const axios = require("axios");
const HttpError = require("../models/http-error");
const API_KEY = process.env.GOOGLE_API_KEY;

async function getCoordsForAddress(address) {
  const response = await axios.get(
    `https://us1.locationiq.com/v1/search.php?key=${API_KEY}&q=${encodeURIComponent(
      address
    )}&format=json`
  );
  //note that the response is an array, so for now I will be just taking the first element.
  const data = response.data[0];

  console.log("data:", data);

  if (!data || data.status === "ZERO_RESULTS") {
    const error = new HttpError(
      "Could not find location for the specified address.",
      422
    );
    throw error;
  }

  const coorLat = data.lat;
  const coorLon = data.lon;
  const coordinates = {
    lat: coorLat,
    lng: coorLon,
  };

  return coordinates;
}

module.exports = getCoordsForAddress;

// const axios = require("axios");
// const HttpError = require("../models/http-error");

// async function getCoorsForAddress(address) {
//   /* ctrl + / */
//   //  return {
//   //     lat: 40.7484405,
//   //     lng: -73.9878584,
//   //   };
//   const response = await axios.get();
//   const data = response.data;
//   if (!data || data.status === "ZERO_RESULTS") {
//     throw new HttpError(
//       "Could not find location for the specified address.",
//       422
//     );
//   }
//   const coordinates = data.results;
//   return coordinates;
// }
// exports.getCoorsForAddress = getCoorsForAddress;
