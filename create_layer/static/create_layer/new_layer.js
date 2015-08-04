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

var getSize = function(options){
    var obj = JSON.parse(options);
    return obj['max_length'];
};

var getDecimal = function(attr){
    if(attr['type_field'] == 'DecimalField'){
        return 5;
    }
    else
        return 0;
};

var getTypeFromRestFul = function(type){
    switch(type){
        case 'CharField':
            type = 'Character';
            break;
        case 'DecimalField':
        case 'IntegerField':
            type = 'Number';
            break;
        case 'BooleanField':
            type = 'Logical';
            break;
        case 'DateTimeField':
            type = 'Date';
            break;
    }

    return type;
};

var convertToNG = function(attr,i){
    var newAttr = { 'id': i,
                    'pk': attr['id'],
                    'attributeName': attr['name_field'],
                    'attributeType': getTypeFromRestFul(attr['type_field']),
                    'attributeSize': getSize(attr['options']),
                    'attributeDecimal': getDecimal(attr)};
    return newAttr;
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
    var type = convertType(attribute.attributeType, attribute.attributeDecimal);
    return {
        "name_field": attribute.attributeName,
        "type_field": type,
        "name_module_field": "django.forms",
        "options": "{\"max_length\": \""+attribute.attributeSize+"\", \"blank\": \"false\"}",
        "community": community_id
    };
};

var loadData = function(dataIncoming){
    var data = [];
    for(var i=0; i<dataIncoming.length; i++){
        var attr = dataIncoming[i];
        var newAttr = convertToNG(attr,i);

        data.push(newAttr);
    }

    return data;
};

(function(){
    var app = angular.module("layer_app",[]).config(function($interpolateProvider) {
        $interpolateProvider.startSymbol('{$');
        $interpolateProvider.endSymbol('$}');
    }).run(run);

    run.$inject = ['$http'];
    function run($http){
        $http.defaults.xsrfHeaderName = 'X-CSRFToken';
        $http.defaults.xsrfCookieName = 'csrftoken';
    }

    app.layerController = function($scope, $http){

        $scope.layerName = 'myLayer';
        $scope.layerType = 'Point';
        $scope.attributes = [];

        $scope.attributeName = 'attributeName';
        $scope.attributeType = 'Character';
        $scope.attributeSize = 50;
        $scope.attributeDecimal = 0;

        $scope.deletedList = [];

        $http.get(url_filter).success(function(dataIncoming){
            $scope.attributes = loadData(dataIncoming);
        });

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

            var attr = {id: $scope.attributes.length,
                        pk: null,
                        attributeName: $scope.attributeName,
                        attributeType:  $scope.attributeType,
                        attributeSize: $scope.attributeSize,
                        attributeDecimal: $scope.attributeDecimal };

            $scope.attributes.push(attr);

            $scope.attributeName = 'attributeName';
            $scope.attributeType = 'Character';
            $scope.attributeSize = 50;
            $scope.attributeDecimal = 0;
        };

        $scope.removeAttribute = function(index){
            var id = $scope.attributes[index]['pk'];
            if( id != null ) $scope.deletedList.push(id);

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

        var deleteAttributesFromDB = function(){
            for(var i=0; i<$scope.deletedList.length; i++) {
                var pk = $scope.deletedList[i];
                var url_delete = url_update + pk + "/";
                $http.delete(url_delete);
            }
        };

        var findNullPK = function(){
            var x = -1;
            for(var i=0; i<$scope.attributes.length; i++){
                if($scope.attributes[i].pk == null){
                    x = i;
                    break;
                }
            }
            return x;
        };

        $scope.sendData = function(){
            removeMessages();
            deleteAttributesFromDB();

            for(var i=0; i<$scope.attributes.length; i++) {
                if($scope.attributes[i].pk != null) continue;

                var attr = $scope.attributes[i];
                var localData = convertToRestFul(attr);

                $http.post(url_create, localData,
                    {
                        headers: {'Content-Type': "application/json"}
                    })
                    .success(function (dataIncoming) {
                        var x = findNullPK();
                        $scope.attributes[x] = convertToNG(dataIncoming, x);
                        showMessage("Succes to save attribute: '"+attr.attributeName+"'!", "success");

                    })
                    .error(function(){
                        showMessage("Error to save attribute: '"+attr.attributeName+"'!", "danger");
                    }
                );
            }
        };
    };

    app.controller("LayerController",['$scope', '$http', app.layerController]);

})();