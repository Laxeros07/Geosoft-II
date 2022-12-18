var express = require("express");
var router = express.Router();
var R = require("r-integration");
const MongoClient = require("mongodb").MongoClient;
const app = require("../app");

const fs = require("fs");
const path = require("path");

const directory = path.join(__dirname, "../public/uploads");
/*
fs.readdir(directory, (err, files) => {
  if (err) throw err;

  for (const file of files) {
    fs.unlink(path.join(directory, file), (err) => {
      if (err) throw err;
    });
  }
});
*/
var filetype;

const multer = require("multer");
const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: (req, file, cb) => {
    console.log(file);
    filetype = file.originalname.toString().split(".")[1];
    switch (filetype) {
      case "geojson":
        cb(null, "trainingsdaten.geojson");
        break;
      case "json":
        cb(null, "trainingsdaten.geojson");
        break;
      case "gpkg":
        cb(null, "trainingsdaten.gpkg");
        break;
      case "tif":
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
  console.log("Filetype");
  console.log(filetype);
  if (filetype == "gpkg") {
    R.callMethod("public/rScripts/gpkgToGeojson_converter.r", "konvertierung", {
      x: "x",
    });
  }
  res.send({ message: filetype });
}

module.exports = router;
