var rasterLayer;
var klassifikationLayer;
var aoaLayer;
var geojsonLayer;

function addGeoJSONToMap(url) {
  // this requests the file and executes a callback with the parsed result once it is available
  fetchJSONFile(url, function (data) {
    trainingspolygone = data;
    // Die verschiedenen Labels werden in einem Set gespeichert
    let labels = new Set();
    data.features.forEach((element) => {
      labels.add(element.properties.Label);
    });
    // Das Set mit den Labels wird in einen Array umgewandelt
    const labelsArray = Array.from(labels);
    let layerArray = [];
    // Für jedes Array wird eine zufällige Frabe erstellt und in der Variabel color gespeichert
    for (let index = 0; index < labelsArray.length; index++) {
      let label = labelsArray[index];
      color = getRandomColor();
      // Für jedes Label werden alle features mit dem selben Label herausgefiltert und bekommen die
      // Farbe zuvor gespeicherte Farbe zugeordnet
      data.features.forEach((element) => {
        if (element.properties.Label == label) {
          layerArray.push(
            L.geoJSON(element, {
              style: {
                color: color,
                fillColor: color,
                weight: 3,
                opacity: 0.65,
                fillOpacity: 0.65,
              },
            }).bindPopup(function (layer) {
              return layer.feature.properties.Label;
            })
          );
        }
      });
    }
    let group = L.layerGroup(layerArray).addTo(map);
    geojsonLayer = layerArray;
    layerControl.addOverlay(group, "Trainingspolygone");
  });
}

/**
 * Ruft eine lokale JSON Datei auf
 * Quelle: https://stackoverflow.com/questions/14388452/how-do-i-load-a-json-object-from-a-file-with-ajax
 * @param {*} path
 * @param {*} callback
 */

function fetchJSONFile(path, callback) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        var data = JSON.parse(httpRequest.responseText);
        if (callback) callback(data);
      }
    }
  };
  httpRequest.open("GET", path);
  httpRequest.send();
}

function addGeotiffToMap(url) {
  fetch(url)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => {
      parseGeoraster(arrayBuffer).then((georaster) => {
        console.log("georaster:", georaster);

        rasterLayer = new GeoRasterLayer({
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
        // map.createPane("rasterPane");
        // map.getPane("rasterPane").style.zIndex = 600;
        // layer.pane = "rasterpane";
        // rasterLayer.setZIndex(500);
        rasterLayer.addTo(map);
        rasterLayer.bringToBack();
        //layer.addTo(map);

        layerControl.addOverlay(rasterLayer, "Rasterbild");

        map.fitBounds(rasterLayer.getBounds());
        setOrder();
      });
    });
}

function addPredictionAndAoaToMap(predUrl, aoaUrl) {
  fetch(predUrl)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => {
      parseGeoraster(arrayBuffer).then((georaster) => {
        console.log("georaster:", georaster);

        klassifikationLayer = new GeoRasterLayer({
          georaster: georaster,
          resolution: 256 /**,
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
          },*/,
        });
        // map.createPane("predictionPane");
        // map.getPane("predictionPane").style.zIndex = 700;
        // layer.pane = "predictionPane";
        // klassifikationLayer.setZIndex(600);
        klassifikationLayer.addTo(map);

        layerControl.addOverlay(klassifikationLayer, "Klassifikation");

        map.fitBounds(klassifikationLayer.getBounds());
        setOrder();
      });
    });

  fetch(aoaUrl)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => {
      parseGeoraster(arrayBuffer).then((georaster) => {
        console.log("georaster:", georaster);

        aoaLayer = new GeoRasterLayer({
          georaster: georaster,
          resolution: 256,
        });
        // map.createPane("aoaPane");
        // map.getPane("aoaPane").style.zIndex = 1000;
        // aoaLayer.pane = "aoaPane";
        aoaLayer.addTo(map);

        layerControl.addOverlay(aoaLayer, "AOA");

        map.fitBounds(aoaLayer.getBounds());
        setOrder();
      });
    });
}

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// checkt, ob das Dateiformat Geopackage ist
function getDateityp(name) {
  extension = name.toString().split(".")[1];
  //console.log(extension);
  return extension;
}

function setOrder() {
  rasterLayer.bringToBack();
  osm.bringToBack();
  satellite.bringToBack();
  aoaLayer.bringToFront();
}
