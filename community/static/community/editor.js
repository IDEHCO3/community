var map = L.map('map', initializeContextMenuMap()).setView([-21.2858, -41.78682], 2);
var editableGeojson = null;
var json_properties = [];
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
    var controllerScope = angular.element($('#bookmarkers')).scope();
    controllerScope.bookmarker();
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
                callback: function () {
                    var controllerScope = angular.element($('#page-wrapper')).scope();
                    controllerScope.populateForm(layer);
                }
            }, {
                separator: true
            }]
    });

}

function editableMode(activate){
    if(activate){
        var controllerScope = angular.element($("#page-wrapper")).scope();
        var geometry = controllerScope.geometry.type_field;

        var options = function(editableLayer) {

            return {
                position: 'topleft',
                draw: {

                    rectangle: false,
                    polygon: "polygon" == geometry,
                    polyline: "line" == geometry,
                    circle: false,
                    marker: "point" == geometry
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

    var controllerScope = angular.element($('#page-wrapper')).scope();

    map.on('draw:created', function (e) {
        var type = e.layerType;
        var layer = e.layer;
        var a_feature = layer.toGeoJSON();

        a_feature.id = null;
        a_feature.properties.properties = controllerScope.emptyProperties;
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
            controllerScope.updateGeometry(layer);
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