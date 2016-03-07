(function() {
    var app = angular.module('ListApp', ['auth'])
        .config(function ($interpolateProvider) {
            $interpolateProvider.startSymbol('{$');
            $interpolateProvider.endSymbol('$}');
        });

    app.controller('ListCommunituController', ['$http', '$scope', function($http, $scope){
        $scope.communities = [];

        $http.get(urls.communitties)
            .success(function(data){
                $scope.communities = data;
            }).error(function(data){
                console.log(data);
            });

        $scope.getURLDetail = function(community){
            return urls.community_detail + "/" + community.id + "/";
        };
    }]);
})();