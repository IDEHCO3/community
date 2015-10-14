(function(){
    var app = angular.module("community_app",[])
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
            $scope.logout();
            path = $window.location.pathname;
            $window.location = '/authentication/?next='+path;
        };
    }]);

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


        $scope.bookmarker = function(){

            //var absUrl = $location.absUrl();
            var center = angular.toJson(dicToArray(map.getCenter()));
            var name = $("#bookmark_name").val();

            var bookmark = {
                "name": name,
                "url_visual": url_visual,
                "url_api": url_community,
                "zoom": map.getZoom(),
                "resourceType": "communities",
                "coordinates": center,
                "owner": user_id
            };

            $http.post("http://127.0.0.1:8000/bookmarks/", bookmark)
                .success(function(data){
                    console.log(data);
                    var coord = angular.fromJson(data.coordinates);
                    data.lat = coord[0];
                    data.lng = coord[1];
                    $scope.bookmarks.push(data);
                })
                .error(function(data){
                    console.log(data);
                    console.log("Error in save bookmark.");
                });
        };
    }]);

    var isGeometryField = function(type_field){
        var geoms = ['point', 'line', 'polygon'];
        for(var i=0; i < geoms.length; i++){
            if(geoms[i] == type_field){
                return true;
            }
        }
        return false;
    };

    var commentsTemplate = $("#model_comments_list").html();

    app.directive('comments', function(){
        return {
            restrict: 'A',
            scope: {
                discussionList: '=comments'
            },
            replace: true,
            template: commentsTemplate.replace('list','discussionList').replace(/item/g, 'comment')
        }
    });

    app.directive('subComments', function($compile){
        return {
            restrict: 'A',
            scope:{
                list: '=subComments'
            },
            replace: true,
            template: "<div></div>",
            link: function (scope, element, attrs) {
                element.append(commentsTemplate);
                element.find('#show_answers').attr('ng-click','showAnswers(item)');
                $compile(element.contents())(scope);
            }
        }
    });

    app.controller("LayerController",['$http','$scope', function($http, $scope){
        $scope.schema = [];
        $scope.layers = [];
        $scope.geometry = null;
        $scope.emptyProperties = {};
        $scope.comment = '';
        $scope.url_issues = null;
        $scope.url_layer = null;
        $scope.discussionList = [];
        $scope.community = {name: "Unknown", description: "unknown", schema: []};

        var getProperties = function () {

            var properties = {};
            for(var i=0; i<$scope.schema.length; i++){
                var $attr = $("#attribute_"+i);
                var value = null;
                if($attr.attr("type") == "checkbox"){
                    value = $attr.prop("checked");
                }
                else{
                    value = $attr.val();
                }

                properties[$scope.schema[i].name_field] = value;
            }

            return properties;
        };

        $scope.showAnswers = function(comment){
            console.log("asdfa");
            $http.get(comment.reply)
                .success(function(data){
                    console.log(data);
                    comment['answers'] = data;
                })
                .error(function(data){
                    console.log("Error to load answers: ",data);
                });

        };

        $scope.reply = function(comment){
            console.log(comment);
            console.log("reply");
        };

        $scope.postComment = function(){
            var data = {
                'title': '',
                'issue': $scope.comment
            };

            $http.post($scope.url_issues, data)
                .success(function(data){
                    $scope.discussionList.push(data);
                })
                .error(function(data){
                    console.log("Error to post comment!");
                });

            $scope.comment = '';
        };

        $scope.populateForm = function(layer){
            console.log("it's that!");
            actuallayer = layer;
            var aFeature = layer.feature;

            var properties = angular.fromJson(aFeature.properties.properties);

            for (i = 0; i < $scope.schema.length; i++) {
                var field_name = $scope.schema[i].name_field;
                var field_value = properties[field_name];
                var $attr = $('#attribute_' + i);

                if($attr.attr("type") == "checkbox"){
                    $attr.prop('checked', field_value);
                }
                else{
                    $attr.val(field_value);
                }
            }
            $('#myModal').modal('show');
        };

        $scope.updateGeometry = function(layer){
            var content = layer.feature;

            if(content.id == null){
                var url = url_create;
                $http.post(url, content)
                    .success(function(data){
                        layer.feature.id = data.id;
                    })
                    .error(function(data){
                        console.log("Error to save geometry!");
                        console.log(data);
                    });
            }
            else{
                var url = url_update+content.id+"/";
                $http.put(url, content)
                    .success(function(data){
                        layer.feature.id = data.id;
                    })
                    .error(function(data){
                        console.log("Error to update geometry!");
                        console.log(data);
                    });
            }
        };

        $scope.saveGeometry = function(){
            var properties = getProperties();
            actuallayer.feature.properties.properties = angular.toJson(properties);
            $scope.updateGeometry(actuallayer);
        };

        $scope.deleteGeometry = function(url){
            $http.delete(url)
                .success(function(){
                    console.log('deleted!');
                })
                .error(function(){
                    console.log('Error on delete!');
                });
        };

        $http.get(url_community)
            .success(function(data){
                $scope.community = data;
                $scope.url_issues = data.issues;
                $scope.url_layer = data.layer;
                var schema = data.schema;
                var attributes = [];

                for(var i=0; i<schema.length; i++){
                    if(!isGeometryField(schema[i].type_field)){
                        attributes.push(schema[i]);
                    }
                    else{
                        $scope.geometry = schema[i];
                    }

                    $scope.emptyProperties[schema[i].name_field] = "";
                }

                $scope.community.schema = attributes;

                $http.get($scope.url_issues)
                    .success(function(data){
                        $scope.discussionList = data;
                    })
                    .error(function(data){
                        console.log(data);
                    });

                $http.get($scope.url_layer)
                    .success(function(data){
                        $scope.layers = data;
                        initializeEditableGeoJson($scope.layers);
                        $.jsontotable(json_properties, { id: '#json_table', header: false });

                    }).error(function(data){
                        console.log("Error to load layers data!");
                        console.log(data);
                    });

                delete $scope.community.issues;
                delete $scope.community.layer;
            })
            .error(function(data){
                console.log(data);
            });

        $scope.convertTypeField = function(type){

            var newType = null;
            switch(type){
                case "BooleanField":
                    newType = "checkbox";
                    break;
                case "DecimalField":
                    newType = "number";
                    break;
                case "CharField":
                    newType =  "text";
                    break;
                case "DateTimeField":
                    newType = "date";
                    break;
            }

            return newType;
        };


    }]);
})();
