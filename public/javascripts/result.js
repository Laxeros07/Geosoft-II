/*Legend specific*/
var legend = L.control({ position: "bottomleft" });

legend.onAdd = function () {
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML += "<h4>AoA</h4>";
  div.innerHTML += '<i style="background: #000"></i><span>Gut</span><br>';
  div.innerHTML += '<i style="background: #fff"></i><span>Schlecht</span><br>';
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

map.createPane('labels');
