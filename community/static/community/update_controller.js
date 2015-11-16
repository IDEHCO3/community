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

    app.controller("UserController", ['$http', '$scope', '$window', function($http, $scope, $window){

        $scope.user = {username: "unknown", first_name: "Unknown"}
        var url_authentication_me = "/authentication/me/";
        $scope.authenticated = false;

        if($window.sessionStorage.token != null){
            $http.get(url_authentication_me)
                .success(function(data){
                    $scope.user = data;
                    $scope.authenticated = true;
                })
                .error(function(data){
                    console.log(data);
                });
        }

        $scope.logout = function(){
            if($window.sessionStorage.token != null){
                delete $window.sessionStorage.token;
            }

            $window.location = '';
        };

        $scope.login = function(){
            path = $window.location.pathname;
            $window.location = '/authentication/?next='+path;
        };
    }]);

    app.directive('fileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;

                element.bind('change', function(){
                    scope.$apply(function(){
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }]);

    app.service('fileUpload', ['$http', function ($http) {
        this.uploadFileToUrl = function(file, uploadUrl){
            var fd = new FormData();
            fd.append('file', file);
            $http.put(uploadUrl+"/"+file.name+"/", fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': '*/*'}
            })
            .success(function(){
                    console.log("Success!");
            })
            .error(function(){
                    console.log("Error!");
            });
        }
    }]);

    app.updateController = function($scope, $http, $window, fileUpload){

        $scope.community = {
            name: "",
            description: "",
            need_invitation: false,
            schema: []
        };

        $scope.layerType = 'point';
        $scope.attributeName = '';
        $scope.attributeType = 'CharField';

        $scope.geoFile = null;

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
                    console.log("Error to load data!");
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
            var url_upload = '/communities/files/upload';

            if($scope.geoFile != null) {
                fileUpload.uploadFileToUrl($scope.geoFile, url_upload);
                $scope.community['filename'] = $scope.geoFile.name;
            }

            loadGeometryType();

            $http.post(community_url_post, $scope.community)
                .success(function(community){
                    $window.location.href = community_detail_url + community.id + "/";
                })
                .error(function(){
                    console.log("Error to save community!");
                });
        };

        $scope.update = function(){
            loadGeometryType();

            $http.put(url_update_community, $scope.community)
                .success(function(data){
                    $window.location.href = community_detail_url;
                })
                .error(function(){
                    console.log("Error to update community!");
                });
        };
    };

    app.controller("UpdateController",['$scope', '$http', '$window', 'fileUpload', app.updateController]);

})();