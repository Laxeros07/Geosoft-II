/**
 * GeoJSON objects are added to the map through a GeoJSON layer.
 * To create it and add it to a map, we can use the following code
 * a function that styles individual features based on their properties
 */

let trainingspolygone = L.layerGroup().addTo(map);
// fill that layer with data from a geojson file

L.geoJSON(trainingsgebiete, {
  onEachFeature: addMyData,
  style: function (feature) {
    switch (feature.properties.Label) {
      case "See":
        return { color: "#0a1cb1" };
      case "Siedlung":
        return { color: "#e57423" };
      case "FLiessgewaesser":
        return { color: "#23c3e5" };
      case "Laubwald":
        return { color: "#2aa43d" };
      case "Mischwald":
        return { color: "#11671e" };
      case "Gruenland":
        return { color: "#92e597" };
      case "Industriegebiet":
        return { color: "#696969" };
      case "Acker_bepflanzt":
        return { color: "#70843a" };
      case "Offenboden":
        return { color: "#472612" };
    }
  },
})
  .addTo(map)
  .bindPopup(function (layer) {
    return layer.feature.properties.Label;
  });

var url_to_geotiff_file = "../beispieldaten/sentinelRaster2_umprojiziert.tif";

fetch(url_to_geotiff_file)
  .then((response) => response.arrayBuffer())
  .then((arrayBuffer) => {
    parseGeoraster(arrayBuffer).then((georaster) => {
      console.log("georaster:", georaster);

      var layer = new GeoRasterLayer({
        georaster: georaster,
        resolution: 256,
        pixelValuesToColorFn: (values) => {
          let maxs = georaster.maxs;
          let mins = georaster.mins;

          values[0] = Math.round(
            (255 / (4000 - mins[0])) * (values[0] - mins[0])
          );
          values[1] = Math.round(
            (255 / (4000 - mins[1])) * (values[1] - mins[1])
          );
          values[2] = Math.round(
            (255 / (4000 - mins[2])) * (values[2] - mins[2])
          );

          // make sure no values exceed 255
          values[0] = Math.min(values[0], 255);
          values[1] = Math.min(values[1], 255);
          values[2] = Math.min(values[2], 255);

          // treat all black as no data
          if (values[0] === 0 && values[1] === 0 && values[2] === 0)
            return null;

          return `rgb(${values[2]}, ${values[1]}, ${values[0]})`;
        },
        /*
        pixelValuesToColorFn: (values) =>
          values[0] > 255
            ? null
            : `rgb(${values[0]},${values[1]},${values[2]})`,*/
      });
      layer.addTo(map);

      map.fitBounds(layer.getBounds());
    });
  });

//var layer = L.leafletGeotiff(
//  "http://localhost:3000/beispieldaten/sentinelRaster2_umprojiziert.tif"
//).addTo(map);

// This function is run for every feature found in the geojson file. It adds the feature to the empty layer we created above
function addMyData(feature, layer) {
  trainingspolygone.addLayer(layer);
  // some other code can go here, like adding a popup with layer.bindPopup("Hello")
}
var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create("div", "info"); // create a div with a class "info"
  this.update();
  return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
  this._div.innerHTML =
    "<h4>Trainingspolygone Münster</h4>" +
    (props
      ? "<b>" +
        props.id +
        "</b><br />" +
        props.Label +
        " people / mi<sup>2</sup>"
      : "Hover over a state");
};

info.addTo(map);

function highlightFeature(e) {
  var layer = e.target;
  layer.setStyle({
    weight: 5,
    color: "#666",
    dashArray: "",
    fillOpacity: 0.7,
  });
  layer.bringToFront();
  info.update(layer.feature.properties);
}

function resetHighlight(e) {
  geojson.resetStyle(e.target);
  info.update();
}

var legend = L.control({ position: "bottomright" });
