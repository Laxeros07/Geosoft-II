// Karte mit Zentrum definieren
var map = L.map("map").setView([52, 7.6], 10);

// OSM Layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

function uploadTrainingsdaten() {}
