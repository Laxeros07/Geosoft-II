/*Legend specific*/
var legend = L.control({ position: "bottomright" });

legend.onAdd = function () {
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML += "<h4>AoA</h4>";
  div.innerHTML +=
    '<i style="background: #000"></i><small><span>Gute Klassifikation</span></small><br>';
  div.innerHTML +=
    '<i style="background: #fff"></i><small><span>Schlechte Klassifikation</span></small><br>';
  div.innerHTML += "<h4>AoA Differenz</h4>";
  div.innerHTML +=
    '<i style="background: #000"></i><small><span>Verschlechtert</span></small><br>';
  div.innerHTML +=
    '<i style="background: #666"></i><small><span>Gleich</span></small><br>';
  div.innerHTML +=
    '<i style="background: #fff"></i><small><span>Verbessert</span></small><br>';
  return div;
};

legend.addTo(map);

var legend2 = L.control({ position: "bottomleft" });

legend2.onAdd = function () {
  var img = L.DomUtil.create("img", "legend");
  img.src += "http://localhost:3000/legend.png";
  return img;
};

legend2.addTo(map);

// Add Data to map
addGeotiffToMap("http://localhost:3000/rasterdaten.tif");
addPredictionAndAoaToMap(
  "http://localhost:3000/prediction.tif",
  "http://localhost:3000/AOA_klassifikation.tif"
);
addGeoJSONToMap("http://localhost:3000/trainingsdaten.geojson");
addDIToMap("http://localhost:3000/maxDI.geojson");
addAoaDifToMap("http://localhost:3000/AOADifferenz.tif");

map.createPane("labels");
