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
            }).error(function(data) {
                if (data != null){
                    console.log("Error to load data: " + data.detail);
                }
                else{
                    console.log("Connection error!");
                }
            });
    }]);

    app.controller("LayerController",['$http','$scope', function($http, $scope){
        $scope.schema = [];
        $scope.layers = [];

        $http.get(url_schema)
            .success(function(data){
                $scope.schema = data;
                console.log(data);
            }).error(function(data){
                console.log("Error to load schema data!");
                console.log(data);
            });

        $http.get(url_json)
            .success(function(data){
                $scope.layers = data;
                initializeEditableGeoJson($scope.layers);
                $.jsontotable(json_properties, { id: '#json_table', header: false });

            }).error(function(data){
                console.log("Error to load layers data!");
                console.log(data);
            });
    }]);
})();
