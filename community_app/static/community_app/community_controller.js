(function(){
    var app = angular.module("community_app",[]).config(function($interpolateProvider) {
        $interpolateProvider.startSymbol('{$');
        $interpolateProvider.endSymbol('$}');
    });

    /*app.run(['$http', function($http) {
        $http.defaults.headers.common['Authorization'] = 'Basic ' + btoa('login' + ':' + 'password');
    }]);*/

    app.controller("BookmarkerController",['$http','$scope', function($http, $scope){
        $scope.bookmarks = [];

        $http.get("http://127.0.0.1:8000/bookmarks/")
            .success(function(data){
                data.forEach(function(d){
                    if(d.resourceType == "communities") {
                        var coord = JSON.parse(d.coordinates);
                        d.lat = coord[0];
                        d.lng = coord[1];
                        $scope.bookmarks.push(d);
                    }
                });
            }).error(function(data){
                console.log("Error to load data: "+ data.detail);
            });
    }]);

})();
