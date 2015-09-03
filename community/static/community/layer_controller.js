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

        $scope.attributes = [];

        $scope.attributeName = 'attributeName';
        $scope.attributeType = 'CharField';

        this.createAttribute = function(){

            if( $scope.attributeName === '' )
                return;

            var attr = {id: $scope.attributes.length,
                        name_field: $scope.attributeName,
                        type_field: $scope.attributeType};

            $scope.attributes.push(attr);

            $scope.attributeName = 'attributeName';
            $scope.attributeType = 'CharField';
        };

        $scope.removeAttribute = function(index){
            $scope.attributes.splice(index,1);

            for(var i=0; i < $scope.attributes.length; i++){
                $scope.attributes[i]['id'] = i;
            }
        };
    };

    app.controller("LayerController",['$scope', '$http', app.layerController]);

})();