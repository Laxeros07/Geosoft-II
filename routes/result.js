var express = require("express");
var router = express.Router();
var request = require("request");
var zip = require("express-zip");
const fs = require("fs");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("result", { title: "Result" });
});

router.post("/", function (req, res, next) {
  console.log(req.body);
  if (req.body.algorithmus) {
    let url = "http://172.17.0.1:7001/";
    let bbSplit = "";
    if (req.body.bb) {
      if (req.body.bb != "-") {
        //Es wurde eine Boundingbox angegeben
        bbSplit = req.body.bb.split(",");
      }
    }

    if (req.body.id) {
      //Zusammenbauen der Url mit den Parametern
      switch (req.body.id) {
        case "trainingsdaten":
          url += "result?";
          url += "datenanteil=" + req.body.reduzieren + "&";
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
          url += "datenanteil=" + req.body.reduzieren + "&";
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
    } else {
      url += "result?";
      url += "datenanteil=" + req.body.reduzieren + "&";
    }
    if (req.body.algorithmus == "rf") {
      // Random Forest
      if (req.body.anzahl != "" && req.body.id == "trainingsdaten") {
        url += "baumAnzahl=" + req.body.anzahl + "&";
      }
      if (req.body.tiefe != "" && req.body.id == "trainingsdaten") {
        url += "baumTiefe=" + req.body.tiefe + "&";
      }
      url += "algorithmus=rf";
    } else {
      // Decision Tree
      url += "algorithmus=dt";
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
    var dateien = [];
    console.log("req");
    console.log(req.body);
    // checks which elements have been requested and adds the file paths to an array
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
    console.log("Dateien:");
    console.log(dateien);
    // creates zip and sends it back
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
