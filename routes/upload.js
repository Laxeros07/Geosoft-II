var express = require("express");
var router = express.Router();
var R = require("r-integration");
const MongoClient = require("mongodb").MongoClient;
const app = require("../app");
const request = require("request");
const process = require("process");

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
  destination: "myfiles",
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
      case "RDS":
        cb(null, "modell.RDS");
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
  console.log("Filetype: " + filetype);
  if (filetype == "gpkg") {
    /*
    R.callMethod("public/rScripts/gpkgToGeojson_converter.r", "konvertierung", {
      x: "x",
    });
*/

    request(
      "http://host.docker.internal:7001/convert",
      { json: true },
      (err, res2, body) => {
        if (err) {
          return console.log(err);
        }
        console.log(body);
        console.log(process.cwd());
        fs.readdir("myfiles", (err, files) => {
          files.forEach((file) => {
            console.log(file);
          });
        });

        fs.readFile("myfiles/trainingsdaten.geojson", function read(err, data) {
          if (err) {
            throw err;
          }
          res.send({ message: filetype, json: JSON.parse(data) });
        });
      }
    );
  } else if (filetype == "geojson" || filetype == "json") {
    fs.readFile("myfiles/trainingsdaten.geojson", function read(err, data) {
      if (err) {
        throw err;
      }
      res.send({ message: filetype, json: JSON.parse(data) });
    });
  } else {
    res.send({ message: filetype });
  }
}

module.exports = router;
