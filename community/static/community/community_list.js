(function() {
    var app = angular.module('ListApp', [])
        .config(function ($interpolateProvider) {
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

    app.controller('ListCommunituController', ['$http', '$scope', function($http, $scope){
        $scope.communities = [];

        $http.get(url_communities)
            .success(function(data){
                $scope.communities = data;
            }).error(function(data){
                console.log(data);
            });

        $scope.getURLDetail = function(community){
            return url_detail + community.id + "/";
        };
    }]);
})();