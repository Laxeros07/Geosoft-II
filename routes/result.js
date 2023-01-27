var express = require("express");
var router = express.Router();
var R = require("r-integration");
var request = require("request");
var JSZip = require("jszip");
var zip = require("express-zip");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("result", { title: "Result" });
});

const multer = require("multer");
const { rawListeners } = require("../app");
const { urlencoded } = require("express");
const upload = multer({ dest: "uploads/" });

//router.post("/", upload.single("trainingsdaten"), uploadFiles);
/*
router.post("/bearbeiten", function (req, res, next) {
  res.render("trainingsdaten", { title: "Trainingsdaten bearbeiten" });
});
*/
router.post("/", function (req, res, next) {
  /*
  R.callMethod(
    "public/rScripts/classification2.r",
    "klassifizierung_ohne_Modell",
    {
      x: "x",
    }
  );
  */
  if (req.body.bb) {
    let url = "http://172.17.0.1:7001/";
    let bbSplit = "";
    console.log("bb: " + req.body.bb);
    if (req.body.bb != "") {
      bbSplit = req.body.bb.split(",");
    }
    switch (req.body.id) {
      case "trainingsdaten":
        bbSplit != ""
          ? (url +=
              "result?ymin=" +
              bbSplit[2] +
              "&ymax=" +
              bbSplit[3] +
              "&xmin=" +
              bbSplit[0] +
              "&xmax=" +
              bbSplit[1])
          : (url += "result");
        break;

      case "modell":
        bbSplit != ""
          ? (url +=
              "resultModell?ymin=" +
              bbSplit[2] +
              "&ymax=" +
              bbSplit[3] +
              "&xmin=" +
              bbSplit[0] +
              "&xmax=" +
              bbSplit[1])
          : (url += "resultModell");
        break;
    }
    console.log(url);

    request(url, { json: true }, (err, res2, body) => {
      console.log(res2.body);
      console.log(body);
      if (err) {
        return console.log(err);
      }
      res.render("result", { title: "Result" });
    });
  }
  // Download
  else {
    //var zip = new JSZip();
    var dateien = [];
    console.log("hallo");
    console.log(req.body.aoa_datei);
    if (req.body.prediction_datei) {
      dateien.push({
        path: req.body.prediction_datei,
        name: "classification.tif",
      });
      fs.readFile(req.body.value, function read(err, file) {
        if (err) {
          throw err;
        }
        zip.file("AoA.tif", file);
      });
    }
    if (req.body.polygone_datei) {
      dateien.push({
        path: req.body.polygone_datei,
        name: "polygone.geojson",
      });
    }
    if (req.body.aoa_datei) {
      dateien.push({
        path: req.body.aoa_datei,
        name: "AoA.tif",
      });
    }
    if (req.body.modell_datei) {
      dateien.push({
        path: req.body.modell_datei,
        name: "model.RDS",
      });
    }
    // fs.readFile(req.body.value, function read(err, file) {
    //   if (err) {
    //     throw err;
    //   }
    //   zip.file("AoA.tif", file);
    // });

    // console.log("zip:");
    // console.log(zip.files);
    // var blob = zip.generateAsync({ type: "nodebuffer" });
    // console.log("blob:");
    // console.log(blob.files);
    // //saveAs(blob, "hello.zip");
    res.zip(dateien);
  }
});

/**
 * Aufrufen der Trainingsdatenseit (bearbeiten der seite)
 */
/*
router.post("/trainingsdaten", function (req, res, next) {
  res.render("trainingsdaten", { title: "Demo Result" });
});
*/
function uploadFiles(req, res) {
  res.json({ message: "Successfully uploaded files" });
}

module.exports = router;
