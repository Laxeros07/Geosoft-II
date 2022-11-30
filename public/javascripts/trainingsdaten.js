var trainingsdaten = null;
var json = [];
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

var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

//Leaflet draw control Bar
var drawControl = new L.Control.Draw({
  position: "topright",
  draw: {
    rectangle: false,
    circle: false,
    marker: false,
    polyline: false,
    circlemarker: false,
  },
  edit: {
    featureGroup: drawnItems,
  },
});
map.addControl(drawControl);

map.on("draw:created", function (e) {
  var type = e.layerType,
    layer = e.layer;

  if (type === "marker") {
    layer.bindPopup("ascacacsdcascscsd");
  }

  drawnItems.addLayer(layer);
});

//Popup Name
var getName = function (layer) {
  var name = prompt("please, enter the geometry name", "geometry name");
  return name;
};

//popup Id
var getID = function (layer) {
  var classID = prompt("please, enter the geometry ClassID", "ClassID");
  return classID;
};

map.addControl(drawControl);
map.on(L.Draw.Event.CREATED, function (e) {
  var layer = e.layer,
    feature = (layer.feature = layer.feature || {});
  var name = getName(layer);
  var classID = getID(layer);
  var props = (feature.properties = feature.properties || {}); // Intialize feature.properties
  props.label = name;
  props.classID = classID;
  drawnItems.addLayer(layer);
  if (name == "geometry name") {
    layer.bindPopup("-- no name provided --");
  } else if (name == "") {
    layer.bindPopup("-- no name provided --");
  } else {
    layer.bindTooltip(name, { permanent: true, direction: "top" });
  }
  drawnItems.addLayer(layer);
  // get json
  console.log(JSON.stringify(drawnItems.toGeoJSON()));
  json.push(drawnItems.toGeoJSON());
  console.log(json);
});

var dateiname = null;
function datenAnzeigen() {
  console.log("hallo");
  //document.getElementById('bereich1').innerHTML = json.features[0].geometry.properties.label + '</br>' ;
  auslesen(json);
}

function auslesen() {
  var altes = [];
  i = 0;
  while (i < json.length) {
    altes.push(
      json[i].features[i].geometry.properties.label +
        ":  " +
        json[i].features[i].geometry.properties.classID +
        "</br>"
    );
    i++;
  }
  document.getElementById("bereich1").innerHTML = altes;
}

/**
 * Trainingsdaten exportieren
 * https://github.com/anshori/leaflet-draw-to-geojson-file/blob/master/assets/js/app.js
 */
// Export Button
var showExport =
  '<a href="#" onclick="datenAnzeigen()" title="Export to GeoJSON File" type="button" class="btn btn-danger btn-sm text-light"><i class="fa fa-file-code-o" aria-hidden="true"></i> laden</a>';

var showExportButton = new L.Control({ position: "topright" });
showExportButton.onAdd = function (map) {
  this._div = L.DomUtil.create("div");
  this._div.innerHTML = showExport;
  return this._div;
};
showExportButton.addTo(map);

// Export to GeoJSON File
function geojsonExport() {
  let nodata = '{"type":"FeatureCollection","features":[]}';
  let jsonData = JSON.stringify(drawnItems.toGeoJSON());
  let dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(jsonData);
  let datenow = new Date();
  let datenowstr = datenow.toLocaleDateString("en-GB");
  let exportFileDefaultName = "export_draw_" + datenowstr + ".geojson";
  let linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  if (jsonData == nodata) {
    alert("No features are drawn");
  } else {
    linkElement.click();
  }
}

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
        "Content-Type": "application/json",
      },
      body: toGeojson(trainingsdaten),
    })
      //.then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        showTrainingsdaten(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
      .then((response) => response.json())
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

