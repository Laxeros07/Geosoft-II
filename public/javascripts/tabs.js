function ergebnisAktive() {}

function trainingsdatenAktive() {
  var options = {
    url: "http://localhost:3000/result/bearbeiten",
    method: "POST",
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else {
        var data = JSON.parse(body);
        console.log(data);
        resolve("Fetch from Datamuse API has succeeded!");
      }
    });
  });
}
