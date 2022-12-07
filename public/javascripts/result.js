var json = []; //Geojson Array

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

//Punkte und Attribute zur Tabelle hinzufügen
const table = document.getElementById("tabelle");

function auslesen() {
  var name = [];
  i = 0;
  while (i < json.length) {
    name.push(
      json[i].features[i].geometry.properties.label +
        ":  " +
        json[i].features[i].geometry.properties.classID +
        "</br>"
    );
    i++;
  }

  name.forEach((item, i = 0) => {
    let row = table.insertRow(-1);
    let cell0 = row.insertCell(0);
    let cell1 = row.insertCell(1);

    // Speichern der Nummer und der Attribute in jeder Zeile
    cell0.innerHTML = name;
    cell1.innerHTML = "nummer";
  });

  tabelleFüllen(json);

  document.getElementById("bereich1").innerHTML = name;
  //document.getElementById("bereich2").innerHTML = nummer;
}

function tabelleFüllen() {
  //Punkte und Attribute zur Tabelle hinzufügen
  const table = document.getElementById("tabelle");

  /**
   * Hinzufügen der Gebrige und ihrer Attribute in die Tabelle
   */
  json.forEach((item, i = 0) => {
    let c = item.features.geometry.coordinates; //json[i].features[i].geometry.properties.label
    let p = item.properties;
    i++;

    // Erstellen der Zeilen und Zellen pro Gebirge
    let row = table.insertRow(-1);
    let cell0 = row.insertCell(0);
    let cell1 = row.insertCell(1);

    // Speichern der Nummer und der Attribute in jeder Zeile
    cell0.innerHTML = i;
    cell1.innerHTML = p.label;
    cell2.innerHTML = p.classID;
  });

  console.log(table);

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
          var cell = row.getElementsByTagName("td")[0];
          var id = cell.innerHTML;
          var y = geojson[id - 1].geometry.coordinates[0];
          var x = geojson[id - 1].geometry.coordinates[1];
          map.setView([x, y], 10);
          markerArray[id - 1].openPopup();
        };
      };

      currentRow.onclick = createClickHandler(currentRow);
    }
  }
  window.onload = addRowHandlers();
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
