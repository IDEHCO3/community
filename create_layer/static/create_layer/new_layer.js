var showMessage = function(message, type){
    var element = '<div class="alert alert-'+type+'">';
    element += '<button class="close" data-dismiss="alert" aria-label="close">&times;</button>';
    element += '<strong>'+message+'</strong>';
    element += '</div>';
    $("#alertMessages").append(element);
};

var removeMessages = function(){
    $("#alertMessages").empty();
};

(function(){
    var app = angular.module("layer_app",[]);
    var data = {'layerName' : '',
                'layerType' : '',
                'attributes': [],
                'jsonData': {}};

    app.layerController = function($scope){

        $scope.layerName = 'myLayer';
        $scope.layerType = 'Point';
        $scope.attributes = [{  'id': 0,
                                'attributeName': 'id',
                                'attributeType': 'Number',
                                'attributeSize': 10,
                                'attributeDecimal': 0 }];

        $scope.attributeName = 'attributeName';
        $scope.attributeType = 'Character';
        $scope.attributeSize = 50;
        $scope.attributeDecimal = 0;

        this.setAttributeType = function(type){
            $scope.attributeType = type;
        };

        this.isSet = function(type){
            return $scope.attributeType === type;
        };

        this.hasSize = function(){
            if( $scope.attributeType === 'Date' || $scope.attributeType === 'Logical'){
                return false;
            }
            else{
                return true;
            }
        };

        this.hasDecimal = function(){
            if( $scope.attributeType === 'Number' ){
                return true;
            }
            else{
                return false;
            }
        };

        this.createAttribute = function(){

            if( $scope.attributeName === '' )
                return;

            if( this.hasSize() && $scope.attributeSize === 0 )
                return;

            if( $scope.attributeType === 'Date'){
                $scope.attributeSize = 8;
            }
            else if( $scope.attributeType === 'Logical' ){
                $scope.attributeSize = 1;
            }

            if( typeof $scope.attributeSize != 'number' )
                return;

            if( typeof $scope.attributeDecimal != 'number' )
                return;

            if( $scope.attributeSize > 255 || $scope.attributeSize <= 0 )
                return;

            if( $scope.attributeDecimal > 255 || $scope.attributeDecimal < 0 )
                return;

            $scope.attributes.push({'id': $scope.attributes.length,
                                    'attributeName': $scope.attributeName,
                                    'attributeType':  $scope.attributeType,
                                    'attributeSize': $scope.attributeSize,
                                    'attributeDecimal': $scope.attributeDecimal });

            $scope.attributeName = 'attributeName';
            $scope.attributeType = 'Character';
            $scope.attributeSize = 50;
            $scope.attributeDecimal = 0;
        };

        $scope.removeAttribute = function(index){

            $scope.attributes.splice(index,1);

            for(var i=0; i < $scope.attributes.length; i++){
                $scope.attributes[i]['id'] = i;
            }
        };

        $scope.editAttribute = function(index){
            $scope.attributeName = $scope.attributes[index]['attributeName'];
            $scope.attributeType = $scope.attributes[index]['attributeType'];
            $scope.attributeSize = $scope.attributes[index]['attributeSize'];
            $scope.attributeDecimal = $scope.attributes[index]['attributeDecimal'];
            this.removeAttribute(index);
        };

        var convertType = function(type, decimal){
            switch(type){
                case 'Character':
                    type = "CharField";
                    break;
                case 'Number':
                    type = "DecimalField";
                    break;
                case 'Logical':
                    type = "BooleanField";
                    break;
                case 'Date':
                    type = "DateTimeField";
                    break;
                default:
                    type = "CharField";
                    break;
            }

            if(type == "DecimalField" && decimal == 0) {
                return "IntegerField";
            }

            return type;
        };

        var convertToRestFul = function(attribute){
            var type = convertType(attribute['attributeType'], attribute['attributeDecimal']);
            return {
                "id": 1,
                "name_field": attribute['attributeName'],
                "type_field": type,
                "name_module_field": "django.forms",
                "options": "{\"max_length\": \""+attribute['attributeSize']+"\", \"blank\": \"false\"}",
                "community": community_id
            };
        };

        this.sendData = function(){
            removeMessages();
            for(var i=0; i<$scope.attributes.length; i++) {

                var data = convertToRestFul($scope.attributes[i]);
                var dataJson = JSON.stringify(data);

                $.post(url_create,
                    {
                        _content_type: "application/json",
                        _content: dataJson
                    }
                ).done(function () {
                        console.log("done!");
                        showMessage("Succes to save attribute!", "success");

                }).fail(function(){
                        console.log("fail!");
                        showMessage("Error to save attribute!", "danger");
                });
            }

            console.log("attr:"+$scope.attributes.length);
            console.log("count:"+this.count);

            if($scope.count == $scope.attributes.length){
                $("#succesToSendData").removeClass();
                $("#errorToSendData").addClass('hidden');
            }
            else{
                $("#succesToSendData").addClass('hidden');
                $("#errorToSendData").removeClass();
            }
        };

        this.loadData = function(){
            //TODO
        };

    };

    app.controller("LayerController",['$scope', app.layerController]);

    app.directive("attributesList", function(){
        return {
            restrict: 'E',
            templateUrl: '/static/create_layer/attributes-list.html'
        };
    });

    app.directive("layerInput", function(){
        return {
            restrict: 'E',
            templateUrl: '/static/create_layer/layer-input.html',
            controller: 'LayerController',
            controllerAs: 'layer'
        };
    });

})();

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