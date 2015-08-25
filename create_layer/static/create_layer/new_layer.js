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

var convertToNG = function(attr,i){
    var newAttr = { 'id': i,
                    'pk': attr['id'],
                    'attributeName': attr['name_field'],
                    'attributeType': attr['type_field']}
    return newAttr;
};

var convertToRestFul = function(attribute){
    var type = attribute.attributeType;
    return {
        "name_field": attribute.attributeName,
        "type_field": type,
        "name_module_field": "django.forms",
        "options": "{}",
        "community": community_id
    };
};

var loadData = function(dataIncoming){
    var data = [];
    for(var i=0; i<dataIncoming.length; i++){
        var attr = dataIncoming[i];
        if(attr.name_field == "geometry")
            continue;

        var newAttr = convertToNG(attr,i);

        data.push(newAttr);
    }

    return data;
};

var loadGeometryType = function(dataIncoming){
    var data = {type: "point", id: null};
    for(var i=0; i<dataIncoming.length; i++){
        var attr = dataIncoming[i];
        if(attr.name_field == "geometry"){
            data.type = attr.type_field;
            data.id = attr.id;
            break;
        }
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
        $scope.layerType = 'point';
        $scope.layerTypeId = null;
        $scope.attributes = [];

        $scope.attributeName = 'attributeName';
        $scope.attributeType = 'CharField';

        $scope.deletedList = [];

        $http.get(url_filter).success(function(dataIncoming){
            var local_data = loadGeometryType(dataIncoming);
            $scope.layerType = local_data.type;
            $scope.layerTypeId = local_data.id;
            $scope.attributes = loadData(dataIncoming);
        });

        this.createAttribute = function(){

            if( $scope.attributeName === '' )
                return;

            var attr = {id: $scope.attributes.length,
                        pk: null,
                        attributeName: $scope.attributeName,
                        attributeType: $scope.attributeType};

            $scope.attributes.push(attr);

            $scope.attributeName = 'attributeName';
            $scope.attributeType = 'CharField';
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

        var updateGeometryType = function(){

            var attrGeometry = {
                "name_field": "geometry",
                "type_field": $scope.layerType,
                "name_module_field": "",
                "options": "{}",
                "community": community_id
            };

            if($scope.layerTypeId == null){
                $http.post(url_create, attrGeometry,
                    {
                        headers: {'Content-Type': "application/json"}
                    })
            }
            else{
                var url_geometry = url_update + $scope.layerTypeId;
                $http.put(url_geometry, attrGeometry,
                    {
                        headers: {'Content-Type': "application/json"}
                    })
            }
        };

        $scope.sendData = function(){
            removeMessages();
            deleteAttributesFromDB();
            updateGeometryType();

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
                        showMessage("Succes to save attribute: '"+$scope.attributes[x].attributeName+"'!", "success");

                    })
                    .error(function(){
                        var x = findNullPK();
                        showMessage("Error to save attribute: '"+$scope.attributes[x].attributeName+"'!", "danger");
                    }
                );
            }
        };
    };

    app.controller("LayerController",['$scope', '$http', app.layerController]);

})();