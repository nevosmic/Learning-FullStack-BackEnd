const jsonWebToken = require("jsonwebtoken");

const HttpError = require("../models/http-error");

//middleware for checking if the token is valid
const checkToken = (req, res, next) => {
  if (req.method === "OPTIONS") {
    console.log("OPTIONS");
    return next();
  }
  //Token is encoded in the header of the incoming req
  let token;
  try {
    token = req.headers.authorization.split(" ")[1]; //Authorization: 'Bearer TOKEN'
    if (!token) {
      //Authorization header isnt set at all ->split failes
      throw new Error("Authentication failed!!");
    }
    //there is a token, now check if valid -WITH THE SAME PRIVATE KEY
    const decodedToken = jsonWebToken.verify(token, "private_key_dont_share");
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    const error = new HttpError("Authentication failed", 401);
    return next(error);
  }
};

module.exports = checkToken;
