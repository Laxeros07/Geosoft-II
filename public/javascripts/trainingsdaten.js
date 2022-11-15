var map = L.map('map').setView([51.97, 7.62], 13);

        mapLink = 
            '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
        L.tileLayer(
            'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; ' + mapLink + ' Contributors',
            maxZoom: 18,
            }).addTo(map);

		var LeafIcon = L.Icon.extend({
			options: {
				shadowUrl: 
				    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
				iconSize:     [38, 95],
				shadowSize:   [50, 64],
				iconAnchor:   [22, 94],
				shadowAnchor: [4, 62],
				popupAnchor:  [-3, -76]
			}
		});

		var greenIcon = new LeafIcon({
			iconUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
			});

		var drawnItems = new L.FeatureGroup();
		map.addLayer(drawnItems);

    //Leaflet draw control Bar
		var drawControl = new L.Control.Draw({
			position: 'topright',
			draw: {
				rectangle: false,
        circle: false,
        marker: false, 
        polyline: false,
        circlemarker: false
			},
			edit: {
				featureGroup: drawnItems
			}
		});
		map.addControl(drawControl);

		map.on('draw:created', function (e) {
			var type = e.layerType,
				layer = e.layer;

			if (type === 'marker') {
				layer.bindPopup('A popup!');
			}

			drawnItems.addLayer(layer);
		});


    var getName = function(layer) {
      var name = prompt('please, enter the geometry name', 'geometry name');
      return name;
  };

  map.addControl(drawControl);
  map.on(L.Draw.Event.CREATED, function(e) {
      var layer = e.layer; 
      var name = getName(layer);
      if (name == 'geometry name') {
          layer.bindPopup('-- no name provided --');
      } else if (name == '') {
          layer.bindPopup('-- no name provided --');
      } else {
          layer.bindTooltip(name, {permanent:true, direction:'top'})
      };
      drawnItems.addLayer(layer);
  });
function uploadTrainingsdaten() {}
