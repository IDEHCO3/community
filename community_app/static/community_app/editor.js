$("input").addClass("form-control");

var map = L.map('map', initializeContextMenuMap()).setView([-21.2858, -41.78682], 2);
var editableGeojson = null;
var json_properties = [];
var schema_community_information_array = JSON.parse($schema.text());
var empty_properties = $sjs.text();
var actuallayer = null;

mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; ' + mapLink + ' Contributors',
    maxZoom: 18
    }).addTo(map);

function clickOnLayer(feature, layer ){
    console.log(layer);
    actuallayer = layer;
}

function dragEndLayer(feature, layer ){
    console.log(layer.getLatLng());
    layer.newLatLng = layer.getLatLng();
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

function populateFeatureWhithModal() {
    var aFeature = actuallayer.feature;
    var propers = JSON.parse(aFeature.properties.properties);
    for (i = 0; i < schema_community_information_array.length; i++) {

        var field_name = schema_community_information_array[i];
        var field_html = document.getElementById('id_' + field_name);
        propers[field_name]= field_html.value;

    }
    actuallayer.feature.properties.properties = JSON.stringify(propers);
}

function featureIsNew(feature){
    return feature.id == null;
}

function updateGeometry(layer){
    var content = layer.feature;
    var dataJson = JSON.stringify(content);
    var url = "";
    if(featureIsNew(content)) {
        url = url_create;
    }
    else {
        url = url_update+content.id;
    }

    $.post(url,
        {
            _content_type: "application/json",
            _content: dataJson
        }).done(function(data){
            layer.feature.id = data.id;
        }).fail(function(){
            console.log("Error in save geometry.");
        });
}

function saveGeometry(){
    populateFeatureWhithModal();
    updateGeometry(actuallayer);
}

function editingAttributes(layer){
    populateModalWithFeature(layer);
    $('#myModal').modal('show');
}

function populateModalWithFeature(layer) {
    actuallayer = layer;
    var aFeature = layer.feature;

    for (i = 0; i < schema_community_information_array.length; i++) {
        var field_name = schema_community_information_array[i];
        var field_value = (JSON.parse(aFeature.properties.properties))[field_name];
        var field_html = document.getElementById('id_' + field_name);
        field_html.value=field_value;
    }
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

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

function onEachFeature(feature, layer) {
    layer.options.draggable = true;
    layer.on('click', function() { clickOnLayer(feature, layer); });
    layer.on('dragend', function() { dragEndLayer(feature, layer)});
    binderMenuContextTo(layer);
    json_properties.push(feature.properties);
}
function binderMenuContextTo(layer) {
    layer.bindContextMenu({
        contextmenu: true,
        contextmenuInheritItems: true,
        contextmenuItems: [
            {
                text: 'Marker ',
                callback: function () { alert('Marker: ' + layer.feature.id);      }
            }, {
                text: 'Edit attributes',
                callback: function () { editingAttributes(layer);  }
            }, {
                separator: true
            }]
    });

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

function initializeEditableGeoJson(geoJsons) {
    var editableGeojson = L.geoJson(geoJsons,  {onEachFeature: onEachFeature});

    map.addLayer(editableGeojson);
    var options = function(editableGeojson) {
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

    map.on('draw:created', function (e) {
        var type = e.layerType,
            layer = e.layer,
            a_feature = layer.toGeoJSON();
        a_feature.id = null;
        a_feature.properties.properties = empty_properties;
        layer.feature = a_feature;
        editableGeojson.addLayer( layer);
        actuallayer = layer;

        if (type === 'marker') {
            // Do marker specific actions
            console.log(type);
        }

        // Do whatever else you need to. (save to db, add to map etc)
        map.addLayer(layer);
        binderMenuContextTo(layer);
    });

    map.on('draw:edited', function (e) {
        var layers = e.layers;
        layers.eachLayer(function (layer) {
            //do whatever you want, most likely save back to db
            layer.feature.geometry.coordinates = [layer.newLatLng.lng, layer.newLatLng.lat];
            updateGeometry(layer);
        });
    });

    map.on("draw:deleted", function(e){
        var layers = e.layers;
        layers.eachLayer(function (layer) {
            //do whatever you want, most likely save back to db
            var id = layer.feature.id;
            var url = url_update+id;
            $.ajax({
                method: "DELETE",
                url: url
            });
        });
    });
};

$.getJSON( url_json, function(geoJsons) {
        initializeEditableGeoJson(geoJsons);
    })
    .done(function() {
        $.jsontotable(json_properties, { id: '#json_table', header: false });
    }
);

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
function sameOrigin(url) {
    // test that a given url is a same-origin URL
    // url could be relative or scheme relative or absolute
    var host = document.location.host; // host + port
    var protocol = document.location.protocol;
    var sr_origin = '//' + host;
    var origin = protocol + sr_origin;
    // Allow absolute or scheme relative URLs to same origin
    return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
        (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
        // or any other URL that isn't scheme relative or absolute i.e relative.
        !(/^(\/\/|http:|https:).*/.test(url));
}

$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
            // Send the token to same-origin, relative URLs only.
            // Send the token only if the method warrants CSRF protection
            // Using the CSRFToken value acquired earlier
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});