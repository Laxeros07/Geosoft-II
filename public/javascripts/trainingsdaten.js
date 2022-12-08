var trainingsdaten = null;
//var trainingsdatenInput = document.getElementById("trainingsdatenInput");
//var trainingsdatenHochladen = document.getElementById("trainingsdatenHochladen");

const trainingsdatenForm = document.getElementById("trainingsdatenForm");
const trainingsdatenFiles = document.getElementById("trainingsdatenFiles");
trainingsdatenForm.addEventListener("submit", submitFormT);

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

  // Dateityp wird abgefragt und dann gesetzt
  if (getoutput(dateiname) == "geojson" || getoutput(dateiname) == "json") {
    trainingsdatenFiles.files[0].type = "application/geo+json";
  } else {
    trainingsdatenFiles.files[0].type = "application/octet-stream";
  }

  var loc = window.location.pathname;
  var dir = loc.substring(0, loc.lastIndexOf("/"));
  console.log(dir);

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
      console.log(data);
      var geojsonLayer = new L.GeoJSON.AJAX(
        "../uploads/trainingsdaten.geojson"
      );
      geojsonLayer.addTo(map);

      // this requests the file and executes a callback with the parsed result once it is available
      fetchJSONFile("../uploads/trainingsdaten.json", function (data) {
        console.log(data);
        let labels = new Set();
        data.features.forEach((element) => {
          labels.add(element.properties.Label);
          console.log(labels);
        });
      });
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

// Karte mit Zentrum definieren
var map = L.map("map").setView([52, 7.6], 10);

mapLink = '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; " + mapLink + " Contributors",
  maxZoom: 18,
}).addTo(map);

var LeafIcon = L.Icon.extend({
  options: {
    shadowUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    iconSize: [38, 95],
    shadowSize: [50, 64],
    iconAnchor: [22, 94],
    shadowAnchor: [4, 62],
    popupAnchor: [-3, -76],
  },
});

var greenIcon = new LeafIcon({
  iconUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
});

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
  //console.log(extension);
  return extension;
}
