// Hab den code von der seite https://stuk.github.io/jszip/documentation/examples/downloader.html
// geklaut falls jmd weiter dran bastel will

// save the Form and button as variables
const downloadForm = document.getElementById("downloadForm");
const downloadKnopf = document.getElementById("downloadKnopf");

// save all checkboxes in the form as variables
const klassifikation = document.getElementById("klassifikation");
const polygone = document.getElementById("polygone");
const aoa = document.getElementById("aoa");
const modell = document.getElementById("modell");

// call downloadZip after pressing the download button.
downloadForm.addEventListener("submit", (event) => downloadZip(event));

// this function filters after all checked boxes and sends them to the server
function downloadZip(e) {
  e.preventDefault();
  let formData = new FormData();

  let data = {};

  if (klassifikation.checked == true) {
    formData.append("prediction_datei", klassifikation.value);
    data["prediction_datei"] = klassifikation.value;
  }
  if (polygone.checked == true) {
    formData.append("polygone_datei", polygone.value);
    data["polygone_datei"] = polygone.value;
  }
  if (aoa.checked == true) {
    formData.append("aoa_datei", aoa.value);
    data["aoa_datei"] = aoa.value;
  }
  if (modell.checked == true) {
    formData.append("modell_datei", modell.value);
    data["modell_datei"] = modell.value;
  }
  if (di.checked == true) {
    formData.append("di_datei", di.value);
    data["di_datei"] = di.value;
  }
  if (aoaDifferenz.checked == true) {
    formData.append("aoaDiffernez_datei", aoaDifferenz.value);
    data["aoaDiffernez_datei"] = aoaDifferenz.value;
  }

  console.log(data);

  for (const [name, value] of formData) {
    console.log(name, ":", value);
  }

  fetch("http://localhost:3000/result", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(function (response) {
      // The response is a Response instance.
      // You parse the data into a useable format using `.json()`
      console.log(response);
      return response.blob();
    })
    .then(function (blob) {
      var binaryData = [];
      binaryData.push(blob);
      downloadBlob(binaryData, "Daten.zip");

      //   console.log(blob);
      //   blob.generateAsync({ type: "blob" }).then(
      //     function (blob) {
      //       // 1) generate the zip file
      //       saveAs(blob, "Area_Of_Aplicability.zip"); // 2) trigger the download
      //     }
      //     // function (err) {
      //     //   jQuery("#blob").text(err);
      //     // }
      //   );
    });
}

// Wandelt Daten in ein Blob um, damit diese im Brwoser heruntergeladen werden können
function downloadBlob(binaryData, filename) {
  // Create an object URL for the blob object
  const url = URL.createObjectURL(
    new Blob(binaryData, { type: "application/zip" })
  );

  // Create a new anchor element
  const a = document.createElement("a");

  // Set the href and download attributes for the anchor element
  // You can optionally set other attributes like `title`, etc
  // Especially, if the anchor element will be attached to the DOM
  a.href = url;
  a.download = filename || "download";

  // Click handler that releases the object URL after the element has been clicked
  // This is required for one-off downloads of the blob content
  const clickHandler = () => {
    setTimeout(() => {
      URL.revokeObjectURL(url);
      this.removeEventListener("click", clickHandler);
    }, 150);
  };

  // Add the click event listener on the anchor element
  // Comment out this line if you don't want a one-off download of the blob content
  a.addEventListener("click", clickHandler, false);

  // Programmatically trigger a click on the anchor element
  // Useful if you want the download to happen automatically
  // Without attaching the anchor element to the DOM
  // Comment out this line if you don't want an automatic download of the blob content
  a.click();

  // Return the anchor element
  // Useful if you want a reference to the element
  // in order to attach it to the DOM or use it in some other way
  return a;
}
