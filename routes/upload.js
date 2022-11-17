var express = require("express");
var router = express.Router();
var R = require("r-integration");
const MongoClient = require("mongodb").MongoClient;
const app = require("../app");

const url = "mongodb://localhost:27017"; // connection URL
const client = new MongoClient(url); // mongodb client
const dbName = "Apollo13"; // database name
const collectionName = "trainingsdaten"; // collection nam

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("Upload", { title: "Upload", trainingsdaten: null, radius: "" });
});

// Wird ausgeführt, wenn der Speichern Button gedrückt wurde
router.post("/", function (req, res, next) {
  console.log("Ergebnis:");
  console.log(req.body);

  // connect to the mongodb database and afterwards, insert one the new element
  client.connect(function (err) {
    console.log("Connected successfully to server");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Insert the document in the database
    collection.insertMany(req.body.features, () => loadPage(req.body, res));
  });
});

function loadPage(features, res) {
  res.render("Upload", {
    title: "Upload",
    trainingsdaten: features,
    radius: "",
  });
}
/*
router.post("/", function (req, res, next) {
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

  res.render("Upload", {
    title: "Upload",
    trainingsdaten: null,
    radius: req.body.radius,
  });
});
*/
module.exports = router;
