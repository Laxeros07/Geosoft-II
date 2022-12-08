var trainingsdaten = null;
//var trainingsdatenInput = document.getElementById("trainingsdatenInput");
//var trainingsdatenHochladen = document.getElementById("trainingsdatenHochladen");

const trainingsdatenForm = document.getElementById("trainingsdatenForm");
const trainingsdatenFiles = document.getElementById("trainingsdatenFiles");
trainingsdatenForm.addEventListener("submit", submitFormT);

var trainingspolygone = L.layerGroup().addTo(map);

function submitFormT(e) {
  e.preventDefault();
  let formData = new FormData();

  formData.append("daten", trainingsdatenFiles.files[0]);
  //for (let i = 0; i < files.files.length; i++) {
  //  formData.append("files", files.files[i]);
  //}
  for (var [key, value] of formData.entries()) {
    console.log(key, value);
  }
  var dateiname = trainingsdatenFiles.files[0].name;

  fetch("http://localhost:3000/upload", {
    method: "POST",
    body: formData,
    headers: {},
  })
    .then(function (response) {
      // The response is a Response instance.
      // You parse the data into a useable format using `.json()`
      return response.json();
    })
    .then(function (data) {
      // `data` is the parsed version of the JSON returned from the above endpoint.
      console.log(data); // { "userId": 1, "id": 1, "title": "...", "body": "..." }
      console.log(dateiname);
      //GeoJSON
      if (getoutput(dateiname) == "geojson" || getoutput(dateiname) == "json") {
        console.log("test");
        var geojsonLayer = new L.GeoJSON.AJAX("../uploads/trainingsdaten.json");
        geojsonLayer.addTo(map).bindPopup(function (layer) {
          return layer.feature.properties.Label;
        });

        // this requests the file and executes a callback with the parsed result once it is available
        fetchJSONFile("../uploads/trainingsdaten.json", function (data) {
          console.log(data);
          // Die Labels aus dem geojson werden in einem Set gespeichert,
          // um später die Trainingsdaten auf der Karte farblich zu differenzieren
          let labels = new Set();
          data.features.forEach((element) => {
            labels.add(element.properties.Label);
          });
          console.log(labels);
          // Die Polygone werden auf der Karte farblich differenziert
          const labelsArray = Array.from(labels);
          for (let index = 0; index < labelsArray.length; index++) {
            let label = labelsArray[index];
            console.log(label);
            color = getRandomColor();
            L.geoJSON(data, {
              onEachFeature: addMyData,
              style: function (feature) {
                if (feature.properties.Label == label) {
                  return { color: color };
                }
              },
            }).addTo(map);
          }
        });
      } else {
        //Geopackage
        // Load the Rivers GeoPackage and display the feature layer
        L.geoPackageTileLayer({
          geoPackageUrl: "../uploads/trainingsdaten.gpkg",
          layerName: "rivers_tiles",
        }).addTo(map);
      }
    })
    .catch((err) => ("Error occured", err));
}

/**
 * Ruft eine lokale JSON Datei auf
 * Quelle: https://stackoverflow.com/questions/14388452/how-do-i-load-a-json-object-from-a-file-with-ajax
 * @param {*} path
 * @param {*} callback
 */
function fetchJSONFile(path, callback) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        var data = JSON.parse(httpRequest.responseText);
        if (callback) callback(data);
      }
    }
  };
  httpRequest.open("GET", path);
  httpRequest.send();
}

//trainingsdatenInput.addEventListener("change", fileTrainingChange);
//trainingsdatenHochladen.addEventListener("click", uploadTrainingsdaten);

function showTrainingsdaten(data) {
  var jsonLayer = L.geoJSON(data).addTo(map);
  alert("Hochladen erfolgreich!");

  map.fitBounds(jsonLayer.getBounds());
}

/**
 * Wird ausgeführt, wenn eine Datei hochgeladen wurde.
 * Quelle: https://stackoverflow.com/questions/23344776/how-to-access-data-of-uploaded-json-file
 * @param {*} event
 */

/** 
function fileTrainingChange(event) {
  var reader = new FileReader();
  reader.onload = (event) => {
    trainingsdaten = event.target.result;
    console.log(trainingsdaten);
    //console.log(trainingsdatenInput);

    //uploadTrainingsdaten();
  };
  console.log(event.target.files[0].name);
  reader.readAsText(event.target.files[0]);
  dateiname = event.target.files[0].name;
  console.log(dateiname);
  /*
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(event.target.files[0]); //your file(s) reference(s)
  trainingsdatenInput.files = dataTransfer.files;
  */
//}

/**
 * Trainingsdaten in die Mongodb laden
 * Trainingsdaten in die Mongodb laden
 */

/**
function uploadTrainingsdaten() {
  if (getoutput(dateiname)) {
    if (getoutput(dateiname)) {
      // falls geopackage dateiformat
      // an dieser STelle R Skript ausführen um in geojson umzuwandeln
      fetch("http://localhost:3000/upload", {
        method: "POST", // or 'PUT'
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: trainingsdaten, //toGeojson(trainingsdaten),
      })
        //.then((response) => response.json())
        .then((data) => {
          console.log("Success:", data);
          showTrainingsdaten(data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      // falls geojseon dateiformat
      fetch("http://localhost:3000/upload", {
        method: "POST", // or 'PUT'
        headers: {
          "Content-Type": "application/json",
        },
        body: trainingsdaten,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success:", data);
          showTrainingsdaten(data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
      // falls geojseon dateiformat
      fetch("http://localhost:3000/upload", {
        method: "POST", // or 'PUT'
        headers: {
          "Content-Type": "application/json",
        },
        body: trainingsdaten,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success:", data);
          showTrainingsdaten(data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }

  function showTrainingsdaten(data) {
    var jsonLayer = L.geoJSON(data).addTo(map);
    alert("Hochladen erfolgreich!");

    map.fitBounds(jsonLayer.getBounds());
  }



  function toGeojson(x) {
    var geojsonRahmen = {
      trainingsdaten: null,
      geopackage: null,
    };
    geojsonRahmen.trainingsdaten = x;
    geojsonRahmen.geopackage = true;
    console.log(geojsonRahmen);
    return JSON.stringify({ geojsonRahmen });
    extension = name.toString().split(".")[1];
    console.log(extension);
    if (extension == "gpkg") {
      return true;
    } else {
      return false;
    }
  }
}
 */

// checkt, ob das Dateiformat Geopackage ist
function getoutput(name) {
  extension = name.toString().split(".")[1];
  console.log(extension);
  return extension;
}

// This function is run for every feature found in the geojson file. It adds the feature to the empty layer we created above
function addMyData(feature, layer) {
  trainingspolygone.addLayer(layer);
  // some other code can go here, like adding a popup with layer.bindPopup("Hello")
}
