var express = require("express");
var router = express.Router();
const { MongoClient } = require("mongodb");

const url = "mongodb://localhost:27017"; // connection URL
const client = new MongoClient(url); // mongodb client
const dbName = "mydatabase"; // database name
const collectionName = "newpois"; // collection name

/* Addition home page. */
router.get("/", function (req, res, next) {
  res.render("add", { title: "Addition Page" });
});

/*  */
router.post("/newpoi", function (req, res, next) {
  console.log("A new poi has been added through the user interface");

  console.log(req.body); // show the data that has been passed through the post query

  let poi = {};
  poi.poiname = req.body.pname;
  poi.cityname = req.body.cname;
  poi.coordinates = req.body.longlat;
  poi.link = req.body.picurl;

  addNewPOItoDB(client, dbName, collectionName, poi, res);
});

module.exports = router;
