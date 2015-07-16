/**
 * Created by Rogério on 12/06/2015.
 */
    <script src="http://cdn.leafletjs.com/leaflet-0.7/leaflet.js">
    </script>
    <script src="http://leaflet.github.io/Leaflet.draw/leaflet.draw.js">
    </script>

   <script>
        var map = L.map('map', initializeContextMenuMap()).setView([-21.2858, -41.78682], 9);
        var geojsonlayer = null;
        var jsons_div = document.getElementById("json_div");
        var editableGeojson = null;

        mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
        L.tileLayer(
            'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; ' + mapLink + ' Contributors',
            maxZoom: 18
            }).addTo(map);

        function clickOnLayer(feature, layer ){
            console.log(layer);
        }
        function dragEndLayer(feature, layer ){
            console.log(layer.getLatLng());
        }

         function showCoordinates (e) {
	        console.log(e.latlng);
         }

        function centerMap (e) {
	      map.panTo(e.latlng);
        }

      function zoomIn (e) {
	      map.zoomIn();
      }

      function zoomOut (e) {
	      map.zoomOut();
      }

      function editingAttributes(feature){
          console.log(feature);
      }

      function initializeContextMenuMap() {
           return {
              zoom: 15,
              contextmenu: true,
              contextmenuWidth: 140,
              contextmenuItems: [{
                  text: 'Show coordinates',
                  callback: showCoordinates
              }, {
                  text: 'Center map here',
                  callback: centerMap
              }, '-', {
                  text: 'Zoom in',
                  callback: zoomIn
              }, {
                  text: 'Zoom out',
                  callback: zoomOut
              }]
          }
      }

    </script>
    <script>
        function onEachFeature(feature, layer) {
            layer.options.draggable = true;
            layer.bindContextMenu({
                contextmenu: true,
                contextmenuInheritItems: true,
                contextmenuItems: [
                    {
                        text: 'Marker ',
                        callback: function () { alert('Marker: ' + layer.feature.id);      }
                    }, {
                        text: 'Edit attributes',
                        callback: function () { editingAttributes(feature);  }
                    }, {
                        separator: true

                    }]
            });
            layer.on('click', function() { clickOnLayer(feature, layer); });
            layer.on('dragend', function() { dragEndLayer(feature, layer)});

        }
        function pointToLayer(data, latLng) {
            if (data.geometry.type != 'Point')
                return;
            var marker;
            marker = new L.Marker(latLng, {
                  title: data.id,
                  contextmenu: true,
                  contextmenuItems: [{
                      text: 'Marker item',
                      index: 0,
                      callback: function () {
                          alert('Marker: ' + marker.feature.id);
                      }
                  }, {
                      text: 'Edit attributes',
                      index: 1,
                      callback: function () { editingAttributes(data); }
                  },
                      {
                      separator: true,
                      index: 1
                  }]
            });
            return marker;
        }
    </script>
    <script>
        var geojsonMarkerOptions = {
            radius: 8,
            fillColor: "#ff7800",
            color: "#000",
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.1,
            draggable: true
        };
        function initializeEditableGeoJson(geoJsons) {
            editableGeojson = L.geoJson(geoJsons,  {onEachFeature: onEachFeature});

            map.addLayer(editableGeojson);
            options = function(editableGeojson) {
                return {
                    position: 'topleft',
                    draw: {

                        rectangle: true,
                        polygon: true,
                        polyline: true,
                        circle: true,
                        marker: true
                    },
                    edit: {
                        featureGroup: editableGeojson, //REQUIRED!!
                        remove: true
                    }
                };
            };
            var drawControl = new L.Control.Draw(options(editableGeojson));
            map.addControl(drawControl);
            map.on('draw:edited', function (e) {
                var layers = e.layers;
                    layers.eachLayer(function (layer) {
                        //do whatever you want, most likely save back to db
                        console.log('entrei');
                        console.log(layer);
                    });
            });
        };
    </script>
    <script>
        var jqxhr = $.getJSON( "{{url_json}}", function(geoJsons) {

            initializeEditableGeoJson(geoJsons);
        });

    </script>