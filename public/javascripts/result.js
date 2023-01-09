var json = []; //Geojson Array

// Add Data to map
addGeotiffToMap("http://localhost:3000/rasterdaten.tif");
addPredictionAndAoaToMap("http://localhost:3000/prediction.tif", "");
addGeoJSONToMap("http://localhost:3000/trainingsdaten.geojson");

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
  console.log(drawnItems.toGeoJSON());
  //json speichern
  json.push(drawnItems.toGeoJSON());
});

/**
 * Wird aufgerufen wenn der der laden button gedrückt wird
 */
function datenAnzeigen() {
  console.log("Tabelle leeren");

  //Tabelle zurücksetzen
  tbl = document.getElementById("tabelle");
  tbl.innerHTML = "<tbody><tr><th>Label</th><th>Class_ID</th></tr></tbody>";

  toJson(json);
}

var data = []; //Array für die Geojson
/**
 * Übersichtlicher in ein Geojson speichern
 */
function toJson() {
  data = [];
  var i = 0;
  while (i < json.length) {
    data.push({
      type: "Feature",
      properties: {
        shape: "polygon",
        label: json[i].features[i].geometry.properties.label,
        classID: json[i].features[i].geometry.properties.classID,
        //coordinates:
      },
      geometry: {
        type: "trainingsgebie",
        coordinates: json[i].features[i].geometry.geometry.coordinates,
      },
    });
    i++;
  }
  console.log(data);
  einlesen(data); //die Werte der Tabelle übergeben
}

//Punkte und Attribute zur Tabelle hinzufügen
const table = document.getElementById("tabelle");

/**
 * Tabelle mit den Daten (Label & Class_ID befüllen)
 */
function einlesen() {
  data.forEach((item) => {
    let row = table.insertRow(-1);
    let cell0 = row.insertCell(0);
    let cell1 = row.insertCell(1);

    // Speichern der Nummer und der Attribute in jeder Zeile
    cell0.innerHTML = item.properties.label;
    cell1.innerHTML = item.properties.classID;
  });

  tabelleFüllen(json);
}

function tabelleFüllen() {
  //Punkte und Attribute zur Tabelle hinzufügen
  const table = document.getElementById("tabelle");

  /**
   * Klick-Event-wenn auf Zeile in Tabelle auf Gebirge in Karte zoomen
   * und das PopUp öffnen
   * Quelle: stackoverflow https://stackoverflow.com/questions/1207939/adding-an-onclick-event-to-a-table-row
   */
  function addRowHandlers() {
    var table = document.getElementById("tabelle");
    var rows = table.getElementsByTagName("tr");
    for (i = 0; i < rows.length; i++) {
      var currentRow = table.rows[i];
      var createClickHandler = function (row) {
        return function () {
          var cell = row.getElementsByTagName("td")[0].innerHTML;
          var xy = findXY(cell);
          console.log(xy);
          var y = xy[0];
          console.log(y);
          var x = xy[1];
          map.setView([x, y], 20);
          markerArray[id - 1].openPopup();
        };
      };

      currentRow.onclick = createClickHandler(currentRow);
    }
  }
  window.onload = addRowHandlers();
}

/**
 * Findet die Passenden Coordniaten zu einer Class_ID
 */
function findXY(cell) {
  console.log("sucht");
  var xy = [];
  var i = 0;
  while (data.length > i) {
    console.log("lauft");
    if ((data[i].properties.classID = cell)) {
      xy = data[i].geometry.coordinates[0][1];
      console.log("gefunden" + xy);
    }
    i++;
  }
  return xy;
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

/////////////////////////////////////////////

var map2 = L.map("map2").setView([52, 7.6], 10);

mapLink = '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; " + mapLink + " Contributors",
  maxZoom: 18,
}).addTo(map2);

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
map2.addLayer(drawnItems);
