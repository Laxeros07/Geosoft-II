var express = require("express");
var router = express.Router();
var R = require("r-integration");
const MongoClient = require("mongodb").MongoClient;
const app = require("../app");

var filetype;

const multer = require("multer");
const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: (req, file, cb) => {
    filetype = file.mimetype;
    console.log(file);
    switch (file.mimetype) {
      case "application/geo+json":
        cb(null, "trainingsdaten.json");
        break;
      case "application/octet-stream":
        cb(null, "trainingsdaten.gpkg");
        break;
      case "image/tiff":
        cb(null, "rasterdaten.tif");
        break;
    }
  },
});
const upload = multer({ storage: storage });
//const upload = multer({ dest: "uploads/" });

const url = "mongodb://localhost:27017"; // connection URL
const client = new MongoClient(url); // mongodb client
const dbName = "Apollo13"; // database name
const collectionName = "trainingsdaten"; // collection nam

var trainingsdaten = null;

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("upload", { title: "Upload", radius: "", result: "" });
});

// Läd die Daten in den Upload Ordner hoch
router.post("/", upload.single("daten"), uploadFiles);

function uploadFiles(req, res) {
  console.log("lol");
  console.log("Filetype");
  console.log(filetype);
  res.send({ message: filetype });
}

module.exports = router;
