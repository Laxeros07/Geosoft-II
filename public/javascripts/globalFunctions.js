var rasterLayer;
var klassifikationLayer;
var aoaLayer;
var geojsonLayer;
var aoaDif;

/**
 * adds trainings data to map
 * @param {*} url
 */
function addGeoJSONToMap(url) {
  // this requests the file and executes a callback with the parsed result once it is available
  fetchJSONFile(url, function (data) {
    trainingspolygone = data;
    // all different labels are saved in a set
    let labels = new Set();
    data.features.forEach((element) => {
      labels.add(element.properties.Label);
    });
    // set with labels is turned into an array
    const labelsArray = Array.from(labels);
    let layerArray = [];
    // for every label a random color is generated and saved in the varibale color
    for (let index = 0; index < labelsArray.length; index++) {
      let label = labelsArray[index];
      color = getRandomColor();
      // All features with the same label get the previous in color saved color
      data.features.forEach((element) => {
        if (
          element.properties.Label == label &&
          element.geometry.coordinates.length != 0
        ) {
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
              let text =
                "<b>ClassID:</b> " + layer.feature.properties.ClassID + "<br>";
              text += "<b>Label:</b> " + layer.feature.properties.Label;
              return text;
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
 * adds trainings data to map
 * @param {*} url
 */
function addDIToMap(url) {
  // this requests the file and executes a callback with the parsed result once it is available
  fetchJSONFile(url, function (data) {
    // All features with the same label get the previous in color saved color
    let layerArray = [];
    data.features.forEach((element) => {
      layerArray.push(
        L.geoJSON(element, {
          style: {
            color: "#bc13fe",
            fillColor: "#bc13fe",
            weight: 3,
            opacity: 0.65,
            fillOpacity: 0.65,
          },
        })
      );
    });
    let group = L.layerGroup(layerArray).addTo(map);
    layerControl.addOverlay(group, "Dissimalarity Index");
  });
}

/**
 * calls a local json file
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

/**
 * adds a geotiff in RGB to the map
 * @param {*} url
 */
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
        });

        rasterLayer.addTo(map);
        rasterLayer.bringToBack();

        layerControl.addOverlay(rasterLayer, "Rasterbild");

        map.fitBounds(rasterLayer.getBounds());
        setOrder();
      });
    });
}

/**
 * adds prediction and AOA to map
 * @param {*} predUrl
 * @param {*} aoaUrl
 */
function addPredictionAndAoaToMap(predUrl, aoaUrl) {
  fetch(predUrl)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => {
      parseGeoraster(arrayBuffer).then((georaster) => {
        console.log("georaster:", georaster);

        klassifikationLayer = new GeoRasterLayer({
          georaster: georaster,
          resolution: 256,
        });
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
        aoaLayer.addTo(map);

        layerControl.addOverlay(aoaLayer, "AOA");

        map.fitBounds(aoaLayer.getBounds());
        setOrder();
      });
    });
}

/**
 * adds satellite photo to map
 * @param {*} predUrl
 * @param {*} aoaUrl
 */
function addAoaDifToMap(url) {
  fetch(url)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => {
      parseGeoraster(arrayBuffer).then((georaster) => {
        console.log("georaster:", georaster);

        AoADif = new GeoRasterLayer({
          georaster: georaster,
          resolution: 256,
        });
        AoADif.addTo(map);

        layerControl.addOverlay(AoADif, "Differenz der AoA");
        setOrder();
      });
    });
}

/**
 * generates a random color in hexadicimal format
 * @returns
 */
function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/**
 * chacks if data format is a geopackage
 * @param {*} name
 * @returns
 */
function getDateityp(name) {
  extension = name.toString().split(".")[1];
  return extension;
}

/**
 * sets correct order of layers on the map
 */
function setOrder() {
  if (rasterLayer) {
    rasterLayer.bringToBack();
  }

  osm.bringToBack();
  satellite.bringToBack();

  if (aoaDif) {
    aoaDif.bringToFront();
  }
  if (aoaLayer) {
    aoaLayer.bringToFront();
  }
  if (klassifikationLayer) {
    klassifikationLayer.bringToFront();
  }
}

/**
 * checks if geojson has the correct format and semantics
 * @param {*} geojson
 * @returns
 */
function validateGeoJSON(geojson) {
  // checks if geojsan has a "type" -property and the value "FeatureCollection"
  if (!geojson.hasOwnProperty("type") || geojson.type !== "FeatureCollection") {
    return false;
  }

  // checks if geojson has "features" -property and if it's an array
  if (!geojson.hasOwnProperty("features") || !Array.isArray(geojson.features)) {
    return false;
  }

  // checks every element in the "features" -property according to its structure
  for (let i = 0; i < geojson.features.length; i++) {
    let feature = geojson.features[i];
    if (!feature.hasOwnProperty("type") || feature.type !== "Feature") {
      return false;
    }
    if (!feature.hasOwnProperty("geometry")) {
      return false;
    }
    //coordinates aren't allowed to be empty
    if (feature.geometry.coordinates.length == 0) {
      return false;
    }
    //checks attributes
    if (
      !feature.properties ||
      !feature.properties.id ||
      !feature.properties.ClassID ||
      !feature.properties.Label
    ) {
      return false;
    }
  }

  // return true if everything is correct
  return true;
}
