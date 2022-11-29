var trainingsdaten = null;
var trainingsdatenInput = document.getElementById("trainingsdatenInput");
var trainingsdatenHochladen = document.getElementById(
  "trainingsdatenHochladen"
);

trainingsdatenInput.addEventListener("change", fileTrainingChange);
trainingsdatenHochladen.addEventListener("click", uploadTrainingsdaten);

//Karte mit Zentrum definieren
//var map = L.map("map").setView([54, 7.6], 10);

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
    layer.bindPopup("A popup!");
  }

  drawnItems.addLayer(layer);
});

var getName = function (layer) {
  var name = prompt("please, enter the geometry name", "geometry name");
  return name;
};

map.addControl(drawControl);
map.on(L.Draw.Event.CREATED, function (e) {
  var layer = e.layer;
  var name = getName(layer);
  if (name == "geometry name") {
    layer.bindPopup("-- no name provided --");
  } else if (name == "") {
    layer.bindPopup("-- no name provided --");
  } else {
    layer.bindTooltip(name, { permanent: true, direction: "top" });
  }
  drawnItems.addLayer(layer);
});
map.addControl(drawControl);
map.on(L.Draw.Event.CREATED, function (e) {
  var layer = e.layer;
  var name = getName(layer);
  if (name == "geometry name") {
    layer.bindPopup("-- no name provided --");
  } else if (name == "") {
    layer.bindPopup("-- no name provided --");
  } else {
    layer.bindTooltip(name, { permanent: true, direction: "top" });
  }
  drawnItems.addLayer(layer);
  // get json
  var json = drawnItems.toGeoJSON();
  console.log(json);
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
  /*
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(event.target.files[0]); //your file(s) reference(s)
  trainingsdatenInput.files = dataTransfer.files;
  */
}

function uploadTrainingsdaten() {
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

function showTrainingsdaten(data) {
  var jsonLayer = L.geoJSON(data).addTo(map);
  alert("Hochladen erfolgreich!");

  map.fitBounds(jsonLayer.getBounds());
}