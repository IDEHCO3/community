(function(){
    var app = angular.module("createApp",[]).config(function($interpolateProvider) {
        $interpolateProvider.startSymbol('{$');
        $interpolateProvider.endSymbol('$}');
    }).run(run);

    run.$inject = ['$http'];
    function run($http){
        $http.defaults.xsrfHeaderName = 'X-CSRFToken';
        $http.defaults.xsrfCookieName = 'csrftoken';
    }

    app.createController = function($scope, $http){

        $scope.communityName = "";
        $scope.description = "";
        $scope.needInvitation = false;
        

        $scope.attributes = [];

        $scope.layerType = 'point';
        $scope.attributeName = 'attributeName';
        $scope.attributeType = 'CharField';

        $scope.createAttribute = function(){

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

        $scope.save = function(){
            console.log("save all data!");
        };
    };

    app.controller("CreateController",['$scope', '$http', app.createController]);

})();