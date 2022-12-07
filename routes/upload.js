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

// Wird ausgeführt, wenn der Speichern Button gedrückt wurde

router.post("/", upload.single("daten"), uploadFiles);
//router.post("/", upload.single("rasterdaten"), uploadFiles);

function uploadFiles(req, res) {
  console.log("lol");
  console.log("Filetype");
  console.log(filetype);
  res.send({ message: filetype });
}

// req.file is the `avatar` file
// req.body will hold the text fields, if there were any

router.put("/", function (req, res, next) {
  console.log(req);
  res.send({ data: "Fertig" });
});

router.post("/rSkript", function (req, res, next) {
  //res.redirect("/upload");
  let result;
  switch (req.body.select) {
    case "flaeche":
      result = R.callMethod("public/rScripts/flaeche.r", "x", {
        radius: parseInt(req.body.radius),
      });
      break;
    case "max":
      result = R.executeRScript("public/rScripts/test.r");
      break;
  }

  res.render("upload", {
    title: "Upload",
    trainingsdaten: null,
    radius: req.body.radius,
    result: result,
  });
});

module.exports = router;
//
