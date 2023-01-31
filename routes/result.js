var express = require("express");
var router = express.Router();
var R = require("r-integration");
var request = require("request");
var JSZip = require("jszip");
var zip = require("express-zip");
const fs = require("fs");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("result", { title: "Result" });
});

router.post("/", function (req, res, next) {
  if (req.body.bb) {
    let url = "http://172.17.0.1:7001/";
    let bbSplit = "";
    console.log("bb: " + req.body.bb);
    if (req.body.bb != "-") {
      //Es wurde eine Boundingbox angegeben
      bbSplit = req.body.bb.split(",");
    }

    //Zusammenbauen der Url mit den Parametern
    switch (req.body.id) {
      case "trainingsdaten":
        url += "result?";
        if (bbSplit != "") {
          //Boundingbox
          url +=
            "ymin=" +
            bbSplit[2] +
            "&ymax=" +
            bbSplit[3] +
            "&xmin=" +
            bbSplit[0] +
            "&xmax=" +
            bbSplit[1] +
            "&";
        }
        break;
      case "modell":
        url += "resultModell?";
        if (bbSplit != "") {
          //Boundingbox
          url +=
            "ymin=" +
            bbSplit[2] +
            "ymax=" +
            bbSplit[3] +
            "xmin=" +
            bbSplit[0] +
            "xmax=" +
            bbSplit[1] +
            "&";
        }
        break;
    }
    if (req.body.algorithmus == "rf") {
      // Random Forest
      if (req.body.anzahl != "" && req.body.id == "trainingsdaten") {
        url += "baumAnzahl=" + req.body.anzahl + "&";
      }
      if (req.body.tiefe != "" && req.body.id == "trainingsdaten") {
        url += "baumTiefe=" + req.body.tiefe + "&";
      }
      url += "algorithmus='rf'";
    } else {
      // Decision Tree
      url += "algorithmus='dt'";
    }

    console.log("URL:");
    console.log(url);

    request(url, { json: true }, (err, res2, body) => {
      console.log(res2.body);
      console.log(body);
      if (err) {
        return console.log(err);
      }
      res.render("result", { title: "Result" });
    });
  } else if (req.body.type == "FeatureCollection") {
    const jsonData = req.body;
    console.log(jsonData);
    fs.writeFileSync(
      "myfiles/trainingsdaten.geojson",
      JSON.stringify(jsonData)
    );
    res.send("File saved successfully!");
  }
  // Download
  else {
    //var zip = new JSZip();
    var dateien = [];
    console.log("req");
    console.log(req.body);
    if (req.body.prediction_datei) {
      dateien.push({
        path: req.body.prediction_datei,
        name: "classification.tif",
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
    if (req.body.di_datei) {
      dateien.push({
        path: req.body.di_datei,
        name: "maxDI.geojson",
      });
    }
    if (req.body.aoaDiffernez_datei) {
      dateien.push({
        path: req.body.aoaDiffernez_datei,
        name: "AOADifferenz.tif",
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
    console.log("Dateien:");
    console.log(dateien);
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
