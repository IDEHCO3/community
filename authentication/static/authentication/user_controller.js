(function(){
    var app = angular.module('UserApp', [])
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

    app.controller('UserCtrl', function ($scope, $http, $window) {
        $scope.user = {username: '', password: '', name: ''};
        $scope.message = '';
        $scope.next = url_next;

        if($window.sessionStorage.token != null){
            $http.get(url_authetication_me)
                .success(function(data){
                    console.log(data);
                    $scope.user.name = data.first_name;
                })
                .error(function(data){
                    console.log(data);
                });
        }

        $scope.submit = function () {
            $http.post(url_authetication_token, $scope.user)
                .success(function (data, status, headers, config) {
                    $window.sessionStorage.token = data.token;
                    $scope.message = 'Welcome';
                    $window.location = $scope.next;
                    console.log(data);
                })
                .error(function (data, status, headers, config) {
                    // Erase the token if the user fails to log in
                    delete $window.sessionStorage.token;
                    console.log(data);

                    // Handle login errors here
                    $scope.message = 'Error: Invalid user or password';
                });
        };

        $scope.logout = function(){
            if($window.sessionStorage.token != null){
                delete $window.sessionStorage.token;
                $window.location = url_authetication_index;
            }
        };

        $scope.isAutheticated = function(){
            return $window.sessionStorage.token != null;
        };
    });
})();