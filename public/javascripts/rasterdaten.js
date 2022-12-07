var rasterdaten = null;
var bbox;

//var rasterdatenInput = document.getElementById("rasterdatenInput");
//var rasterdatenHochladen = document.getElementById("rasterdatenHochladen");

//rasterdatenInput.addEventListener("change", (event) => fileRasterChange(event));
//rasterdatenHochladen.addEventListener("click", uploadRasterdaten);

const rasterdatenForm = document.getElementById("rasterdatenForm");
const rasterdatenFiles = document.getElementById("rasterdatenFiles");

rasterdatenForm.addEventListener("submit", submitFormR);

function submitFormR(e) {
  e.preventDefault();
  let formData = new FormData();
  formData.append("daten", rasterdatenFiles.files[0]);
  for (var [key, value] of formData.entries()) {
    console.log(key, value);
  }

  fetch("http://localhost:3000/upload", {
    method: "POST",
    body: formData,
  })
    .then((res) => addGeotiffToMap("../uploads/rasterdaten.tif"))
    .catch((err) => ("Error occured", err));
}

/**
 * Wird ausgeführt, wenn eine Datei hochgeladen wurde.
 * Quelle: https://stackoverflow.com/questions/3814231/loading-an-image-to-a-img-from-input-file
 * @param {*} event
 */
function fileRasterChange(evt) {
  var tgt = evt.target || window.event.srcElement,
    files = tgt.files;

  // FileReader support
  if (FileReader && files && files.length) {
    var fr = new FileReader();
    fr.onload = async function () {
      rasterdaten = fr.result;

      const tiff = await GeoTIFF.fromBlob(files[0]);
      const image = await tiff.getImage();
      const width = image.getWidth();
      const height = image.getHeight();
      const tileWidth = image.getTileWidth();
      const tileHeight = image.getTileHeight();
      const samplesPerPixel = image.getSamplesPerPixel();

      // when we are actually dealing with geo-data the following methods return
      // meaningful results:
      const origin = image.getOrigin();
      const resolution = image.getResolution();
      const keys = image.getGeoKeys();
      bbox = image.getBoundingBox();
      console.log(bbox);

      const response = await fetch("http://localhost:3000/upload", {
        method: "POST", // or 'PUT'
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          epsg: keys.ProjectedCSTypeGeoKey,
          bbox: bbox,
          image: rasterdaten.split(",")[1],
        }),
      });
      const data = await response.json();
      console.log("Success:", data);

      const [red, green, blue] = await image.readRasters();

      var imageUrl = rasterdaten;

      var imageBounds = [
        [parseFloat(data[2]), parseFloat(data[1])],
        [parseFloat(data[4]), parseFloat(data[3])],
      ];
      console.log(
        L.imageOverlay("temporaererDatenspeicher/sentinel.png", imageBounds)
          .addTo(map)
          .bringToFront()
      );
      //L.leafletGeotiff(imageUrl, imageBounds).addTo(map);

      map.fitBounds(imageBounds);
    };
    fr.readAsDataURL(files[0]);
  }
}

function uploadRasterdaten() {
  fetch("http://localhost:3000/upload", {
    method: "POST", // or 'PUT'
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: rasterdaten,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  /*
  fetch("http://localhost:3000/upload", {
    method: "POST", // or 'PUT'
    headers: { "Content-Type": "application/json" },
    body: rasterdaten,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      //showRasterdaten(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });*/
}

function showrasterdaten(data) {
  var jsonLayer = L.geoJSON(data).addTo(map);
  alert("Hochladen erfolgreich!");

  map.fitBounds(jsonLayer.getBounds());
}
