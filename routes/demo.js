var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("demo", { title: "Demo" });
});

router.post("/result", function (req, res, next) {
  res.render("demo_result", { title: "Demo Result" });
});

module.exports = router;

/**
 * creates zip of the demo data and sends it back to the client
 */
router.post("/", function (req, res, next) {
  var dateien = [];
  console.log("req");
  console.log(req.body);
  // adds all data paths from the demo data to an array
  dateien.push({
    path: "beispieldaten/trainingsgebiete.geojson",
    name: "trainingsgebiete.geojson",
  });
  dateien.push({
    path: "beispieldaten/prediction.tif",
    name: "prediction.tif",
  });
  dateien.push({
    path: "beispieldaten/AoA_klassifikation.tif",
    name: "AoA_klassifikation.tif",
  });
  dateien.push({
    path: "beispieldaten/maxDI.geojson",
    name: "maxDI.geojson",
  });
  dateien.push({
    path: "beispieldaten/AOADifferenz.tif",
    name: "maxDI.geojson",
  });

  console.log("Dateien:");
  console.log(dateien);
  res.zip(dateien);
});
