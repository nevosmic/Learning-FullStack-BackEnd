const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};
// a group of middlewares
const fileUpload = multer({
  limits: 500000, // 500 kb
  storage: multer.diskStorage({
    destination: (req, file, callBack) => {
      // the place where I store the data
      callBack(null, "./uploads/images");
    },
    filename: (req, file, callBack) => {
      //extract file extension
      const extension = MIME_TYPE_MAP[file.mimetype];
      // generate a random uniq file name
      callBack(null, uuidv4() + "." + extension);
    },
  }),
  // adding a wrong file scenario
  fileFilter: (req, file, callBack) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype]; //if didnt find an entry its not valid - !! convert undefined to false / other findings to true
    let error = isValid ? null : new Error("Invalid mime type!");
    callBack(error, isValid);
  },
});

module.exports = fileUpload;
