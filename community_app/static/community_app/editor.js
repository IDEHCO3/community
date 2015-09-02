$("input").each(function(){
    var type = $(this).attr("type");
    if( type != "checkbox" && type != "submit" )
        $(this).addClass("form-control");
});

var map = L.map('map', initializeContextMenuMap()).setView([-21.2858, -41.78682], 2);
var editableGeojson = null;
var json_properties = [];
var schema_community_information_array = JSON.parse($schema.text());
var empty_properties = $sjs.text();
var actuallayer = null;
var drawControl = null;
var $editable = $("#editable");


mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; ' + mapLink + ' Contributors',
    maxZoom: 18
    }).addTo(map);


// come�o de carregar layer
var osmLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>',
    thunLink = '<a href="http://thunderforest.com/">Thunderforest</a>';

var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    osmAttrib = '&copy; ' + osmLink + ' Contributors',
    landUrl = 'http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png',
    thunAttrib = '&copy; '+osmLink+' Contributors & '+thunLink;


var osmMap = L.tileLayer(osmUrl, {attribution: osmAttrib}),
    landMap = L.tileLayer(landUrl, {attribution: thunAttrib});
//var a_controlayer = L.control.layers().addTo(map);
var a_controlayer  = L.Control.styledLayerControl();
map.addControl(a_controlayer);
a_controlayer.addBaseLayer(osmMap,'OSM Mapnik', {groupName : "Fixed Layers", expanded: true});
a_controlayer.addBaseLayer(landMap,'Landscape', {groupName : "Fixed Layers", expanded: true});




// fim de carregar layer

function dicToArray(coordinates){
    var coordinate = [coordinates.lat, coordinates.lng];
    return coordinate;
}

function bookmarker(){

    var center = JSON.stringify(dicToArray(map.getCenter()));
    var name = $("#bookmark_name").val();

    var bookmark = {
        "name": name,
        "url_visual": url_visual,
        "url_api": url_community,
        "zoom": map.getZoom(),
        "resourceType": "communities",
        "coordinates": center,
        "owner": user_id
    };

    var dataJson = JSON.stringify(bookmark);

    console.log(dataJson);

    $.post("http://127.0.0.1:8000/bookmarks/",
        {
            _content_type: "application/json",
            _content: dataJson
        }).done(function(data){
            console.log(data);
        }).fail(function(data){
            console.log(data);
            console.log("Error in save bookmark.");
        });

    location.reload();
}

function convertDicCoordinatesToArray(coordinates){
    var output = [];
    for(var i=0; i<coordinates.length; i++){
        var coordinate = [coordinates[i].lng, coordinates[i].lat];
        output.push(coordinate);
    }
    return output;
}

function convertMultiDicToArray(coordinates){
    var output = [];
    for(var i=0; i<coordinates.length; i++){
        var coordinate = convertDicCoordinatesToArray(coordinates[i]);
        output.push(coordinate);
    }
    return output;
}

function clickOnLayer(feature, layer ){
    console.log(layer);
    actuallayer = layer;
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

function populateFeatureWhithModal() {
    var aFeature = actuallayer.feature;
    var propers = JSON.parse(aFeature.properties.properties);
    for (i = 0; i < schema_community_information_array.length; i++) {

        var field_name = schema_community_information_array[i];
        propers[field_name]= $('#id_' + field_name).val();

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


function loadReadOnlyLayer() {

    var overlays = {"layer": null};
    var url_string = $("#layers").val();
    $.ajax({ method: "GET",
             url: url_string
    }).done(function(data){

        overlays.layer= L.geoJson(data,{ });
        a_controlayer.addOverlay(overlays.layer, url_string, {groupName : "GeoJson", expanded: true});
       // overlays.layer.overlay = true;

       //console.log(a_controlayer._layers.length);



    }).fail(function(data){

    });

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
        $('#id_' + field_name).val(field_value);
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
    layer.options.draggable = false;
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

function editableMode(activate){
    if(activate){
        var options = function(editableLayer) {
            return {
                position: 'topleft',
                draw: {

                    rectangle: false,
                    polygon: "polygon" == geometry_type,
                    polyline: "line" == geometry_type,
                    circle: false,
                    marker: "point" == geometry_type
                },
                edit: {
                    featureGroup: editableLayer, //REQUIRED!!
                    remove: true
                }
            };
        };
        if(drawControl == null) drawControl = new L.Control.Draw(options(editableGeojson));
        map.addControl(drawControl);
    }
    else{
        if(drawControl != null)map.removeControl(drawControl);
    }
}

$editable.on('click', function(){
    var edit = $(this).prop("checked");
    editableMode(edit);
});

function initializeEditableGeoJson(geoJsons) {
    editableGeojson = L.geoJson(geoJsons,  {onEachFeature: onEachFeature});

    var bounds = editableGeojson.getBounds();
    if(Object.keys(bounds).length != 0){
        map.fitBounds(bounds);
    }

    map.addLayer(editableGeojson);


    editableMode($editable.prop("checked"));

    map.on('draw:created', function (e) {
        var type = e.layerType;
        var layer = e.layer;
        var a_feature = layer.toGeoJSON();

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
            if(layer.feature.geometry.type != 'Point'){
                if(layer.feature.geometry.type.indexOf("Poly") > -1){
                    layer.feature.geometry.coordinates = convertMultiDicToArray(layer.getLatLngs());
                }
                else {
                    layer.feature.geometry.coordinates = convertDicCoordinatesToArray(layer.getLatLngs());
                }
            }
            else{
                var coordinates = convertDicCoordinatesToArray([layer.getLatLng()]);
                layer.feature.geometry.coordinates = coordinates[0];
                console.log(coordinates);
            }
            console.log(layer);
            //do whatever you want, most likely save back to db
            updateGeometry(layer);
        });
    });

    map.on("draw:deleted", function(e){
        var layers = e.layers;
        layers.eachLayer(function (layer) {
            //do whatever you want, most likely save back to db
            var id = layer.feature.id;
            if(id != null){
                var url = url_update+id;
                $.ajax({
                    method: "DELETE",
                    url: url
                });
            }
        });
    });

    if(global_zoom != 0){
        var latlng = L.latLng(global_lat, global_lng);
        map.setView(latlng, global_zoom);
    }
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