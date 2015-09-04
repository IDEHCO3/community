(function(){

    var community_url_post = "/communities/";
    var community_detail_url = "/communities/detail/";
    var schema_url_create = '/create_layer/create/';

    var app = angular.module("createApp",[]).config(function($interpolateProvider) {
        $interpolateProvider.startSymbol('{$');
        $interpolateProvider.endSymbol('$}');
    }).run(run);

    run.$inject = ['$http'];
    function run($http){
        $http.defaults.xsrfHeaderName = 'X-CSRFToken';
        $http.defaults.xsrfCookieName = 'csrftoken';
    }

    app.createController = function($scope, $http, $window){

        $scope.communityName = "";
        $scope.description = "";
        $scope.needInvitation = false;
        

        $scope.attributes = [];

        $scope.layerType = 'point';
        $scope.attributeName = '';
        $scope.attributeType = 'CharField';

        $scope.createAttribute = function(){

            if( $scope.attributeName === '' )
                return;

            var attr = {id: $scope.attributes.length,
                        name_field: $scope.attributeName,
                        type_field: $scope.attributeType};

            $scope.attributes.push(attr);

            $scope.attributeName = '';
            $scope.attributeType = 'CharField';
        };

        $scope.removeAttribute = function(index){
            $scope.attributes.splice(index,1);

            for(var i=0; i < $scope.attributes.length; i++){
                $scope.attributes[i]['id'] = i;
            }
        };

        var saveLayerSchema = function(community){
            console.log(community);

            for(var i=0; i < $scope.attributes.length; i++){

                var attr = $scope.attributes[i];
                var attribute = {
                    "name_field": attr.name_field,
                    "type_field": attr.type_field,
                    "name_module_field": "django.forms",
                    "options": "{}",
                    "community": community.id
                };

                $http.post(schema_url_create, attribute)
                    .success(function(data){
                        console.log(data);
                    })
                    .error(function(data){
                        console.log(data);
                    });
            }

            $window.location.href = community_detail_url + community.id + "/";
        };

        $scope.save = function(){
            var community_input = {
                "name": $scope.communityName,
                "description": $scope.description,
                "need_invitation": $scope.needInvitation,
                "manager": user_id
            };

            $http.post(community_url_post, community_input)
                .success(function(data){
                    saveLayerSchema(data);
                })
                .error(function(data){
                    console.log(data);
                });
        };
    };

    app.controller("CreateController",['$scope', '$http', '$window', app.createController]);

})();