(function(){

    var app = angular.module("updateApp",[])
        .config(function($interpolateProvider){
            $interpolateProvider.startSymbol('{$');
            $interpolateProvider.endSymbol('$}');
        });

    app.factory('authInterceptor', function ($rootScope, $q, $window) {
        return {
            request: function (config) {
                config.headers = config.headers || {};
                if ($window.sessionStorage.token) {
                    config.headers.Authorization = 'JWT ' + $window.sessionStorage.token;
                }
                return config;
            },
            response: function (response) {
                if (response.status === 401) {
                // handle the case where the user is not authenticated
                }
                return response || $q.when(response);
            }
        };
    });

    app.config(function ($httpProvider) {
        $httpProvider.interceptors.push('authInterceptor');
    });

    app.updateController = function($scope, $http, $window){

        $scope.community = {
            name: "",
            description: "",
            need_invitation: "",
            manager: user_id,
            schema: []
        };

        $scope.layerType = 'point';
        $scope.attributeName = '';
        $scope.attributeType = 'CharField';

        /*if($window.sessionStorage.token != null){
            $http.get(url_authetication_me)
                .success(function(data){
                    console.log(data);
                    $scope.user.name = data.first_name;
                })
                .error(function(data){
                    console.log(data);
                });
        }*/

        if(url_update_community != null) {
            $http.get(url_update_community)
                .success(function (data) {
                    $scope.community = data;

                    var schema = data.schema;
                    var attributes = [];

                    for (var i = 0; i < schema.length; i++) {
                        if (schema[i].name_field == 'geometry') {
                            $scope.layerType = schema[i].type_field;
                        }
                        else {
                            attributes.push(schema[i]);
                        }
                    }

                    $scope.community.schema = attributes;
                })
                .error(function (data) {
                    console.log(data);
                });
        }

        $scope.createAttribute = function(){

            if( $scope.attributeName === '' )
                return;

            var attr = {
                        name_field: $scope.attributeName,
                        type_field: $scope.attributeType
            };

            $scope.community.schema.push(attr);

            $scope.attributeName = '';
            $scope.attributeType = 'CharField';
        };

        $scope.removeAttribute = function(index){
            $scope.community.schema.splice(index,1);
        };

        var loadGeometryType = function(){
            $scope.community.schema.push({
                name_field: "geometry",
                type_field: $scope.layerType
            });
        };

        $scope.save = function(){
            loadGeometryType();

            $http.post(community_url_post, $scope.community)
                .success(function(community){
                    $window.location.href = community_detail_url + community.id + "/";
                })
                .error(function(data){
                    console.log("Error:",data);
                });
        };

        $scope.update = function(){
            loadGeometryType();

            $http.put(url_update_community, $scope.community)
                .success(function(data){
                    $window.location.href = community_detail_url;
                })
                .error(function(data){
                    console.log(data);
                });
        };
    };

    app.controller("UpdateController",['$scope', '$http', '$window', app.updateController]);

})();