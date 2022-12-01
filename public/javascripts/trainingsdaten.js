var trainingsdaten = null;
var trainingsdatenInput = document.getElementById("trainingsdatenInput");
var trainingsdatenHochladen = document.getElementById(
  "trainingsdatenHochladen"
);

trainingsdatenInput.addEventListener("change", fileTrainingChange);
trainingsdatenHochladen.addEventListener("click", uploadTrainingsdaten);

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

/**
 * Wird ausgeführt, wenn eine Datei hochgeladen wurde.
 * Quelle: https://stackoverflow.com/questions/23344776/how-to-access-data-of-uploaded-json-file
 * @param {*} event
 */
function fileTrainingChange(event) {
  var reader = new FileReader();
  reader.onload = (event) => {
    trainingsdaten = event.target.result;
    console.log(trainingsdaten);
    //console.log(trainingsdatenInput);

    //uploadTrainingsdaten();
  };
  reader.readAsText(event.target.files[0]);
  dateiname = event.target.files[0].name;
  console.log(dateiname);
  /*
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(event.target.files[0]); //your file(s) reference(s)
  trainingsdatenInput.files = dataTransfer.files;
  */
}

/**
 * Trainingsdaten in die Mongodb laden
 * Trainingsdaten in die Mongodb laden
 */
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

  // checkt, ob das Dateiformat Geopackage ist
  function getoutput(name) {
    extension = name.toString().split(".")[1];
    console.log(extension);
    if (extension == "gpkg") {
      return true;
    } else {
      return false;
    }
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
