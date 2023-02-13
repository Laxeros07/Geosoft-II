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

// input has to be an integer between 0 and 1000
setInputFilter(
  document.getElementById("baumAnzahl"),
  function (value) {
    return /^\d*$/.test(value) && (value === "" || parseInt(value) <= 1000);
  },
  "Must be between 0 and 1000"
);
setInputFilter(
  document.getElementById("baumTiefe"),
  function (value) {
    return /^\d*$/.test(value) && (value === "" || parseInt(value) <= 1000);
  },
  "Must be between 0 and 1000"
);
/**
 * sets input filter for Baumanzahl and Baumtiefe
 * @param {*} textbox
 * @param {*} inputFilter
 * @param {*} errMsg
 */
function setInputFilter(textbox, inputFilter, errMsg) {
  [
    "input",
    "keydown",
    "keyup",
    "mousedown",
    "mouseup",
    "select",
    "contextmenu",
    "drop",
    "focusout",
  ].forEach(function (event) {
    textbox.addEventListener(event, function (e) {
      if (inputFilter(this.value)) {
        // Accepted value
        if (["keydown", "mousedown", "focusout"].indexOf(e.type) >= 0) {
          this.classList.remove("input-error");
          this.setCustomValidity("");
        }
        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      } else if (this.hasOwnProperty("oldValue")) {
        // Rejected value - restore the previous one
        this.classList.add("input-error");
        this.setCustomValidity(errMsg);
        this.reportValidity();
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      } else {
        // Rejected value - nothing to restore
        this.value = "";
      }
    });
  });
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

// deleting of last point
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
