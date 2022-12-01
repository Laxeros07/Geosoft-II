var express = require("express");
var router = express.Router();
var R = require("r-integration");
const MongoClient = require("mongodb").MongoClient;
const app = require("../app");
/*
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
*/

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
router.post("/", function (req, res, next) {
  if (req.body.select) {
    let result = R.callMethod("public/rScripts/flaeche.r", "x", {
      radius: parseInt(req.body.radius),
    });
    res.render("upload", {
      title: "Upload",
      trainingsdaten: null,
      radius: req.body.radius,
      result: result,
    });
  } else if (req.body.epsg && req.body.bbox) {
    let result = R.callMethod("public/rScripts/coordConvers.r", "x", {
      epsg: req.body.epsg,
      bbox: req.body.bbox,
    });

    res.send(result);
  } else {
    // connect to the mongodb database and afterwards, insert one the new element
    client.connect(function (err) {
      console.log("Connected successfully to server");

      const db = client.db(dbName);
      const collection = db.collection(collectionName);

      trainingsdaten = req.body;

      // Insert the document in the database
      collection.insertMany(trainingsdaten.features, function (err, result) {
        console.log(
          `Inserted ${result.insertedCount} document into the collection`
        );
        console.log(trainingsdaten);
        res.send(trainingsdaten);
      });
    });
  }
});

router.put("/", function (req, res, next) {
  console.log(req);
  res.send({ data: "Fertig" });
});
/*

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
});*/

module.exports = router;
