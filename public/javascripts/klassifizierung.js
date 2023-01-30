const boundingBoxText = document.getElementById("bb");
boundingBoxText.value = "";
const skriptAusfuehren = document.getElementById("skript");
skriptAusfuehren.disabled = true;

boundingBoxText.value = "-";

const smallText = document.getElementById("small");

skriptAusfuehren.addEventListener("click", showLoadingScreen);
const loading = document.getElementById("loading");
function showLoadingScreen() {
  loading.style.display = "block";
}

algorithmus = document.getElementById("algorithmus");
algorithmus.value = "rf";
algorithmus.addEventListener("change", () => {
  switch (algorithmus.value) {
    case "rf":
      document.getElementById("rfAttribute").style.display = "block";
      break;
    case "dt":
      document.getElementById("rfAttribute").style.display = "none";
      break;
  }
});

var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

//Leaflet draw control Bar
var drawControl = new L.Control.Draw({
  position: "topright",
  draw: {
    rectangle: true,
    circle: false,
    marker: false,
    polyline: false,
    circlemarker: false,
    polygon: false,
  },
  edit: {
    featureGroup: drawnItems,
    edit: false,
  },
});

map.addControl(drawControl);
var maske;
map.on("draw:created", function (e) {
  boundingBox = e.layer;
  maske = [
    boundingBox._bounds._southWest.lng,
    boundingBox._bounds._northEast.lng,
    boundingBox._bounds._southWest.lat,
    boundingBox._bounds._northEast.lat,
  ];
  console.log(maske);
  boundingBoxText.value = maske;
  drawnItems.addLayer(boundingBox);
});

// Löschen des letzten Punkts
map.on(L.Draw.Event.DRAWSTART, function (e) {
  if (boundingBox != null) {
    map.removeLayer(boundingBox);
    boundingBoxText.value = "";
  }
});

map.on("draw:deleted", function (e) {
  boundingBox = null;
  boundingBoxText.value = "";
});
