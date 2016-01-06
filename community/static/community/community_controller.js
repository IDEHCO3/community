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

        $scope.user = {username: "unknown", first_name: "Unknown"};
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
                list: '=comments'
            },
            replace: true,
            template: commentsTemplate
        }
    });

    app.directive('subComments', function($compile){
        return {
            restrict: 'A',
            scope:{
                list: '=subComments',
                showAnswers: '=show',
                reply: '=reply'
            },
            replace: true,
            template: "<div></div>",
            link: function (scope, element, attrs) {
                element.append(commentsTemplate);
                $compile(element.contents())(scope);
            }
        }
    });

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
        this.uploadFileToUrl = function(uploadUrl, data){
            var fd = new FormData();

            for(var key in data)
                fd.append(key, data[key]);

            $http.post(uploadUrl, fd, {
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

    var startLoading = function(){
        $('body').addClass('loading');
    };

    var stoptLoading = function(){
        $('body').removeClass('loading');
    };

    app.controller("LayerController",['$http','$scope', '$window', function($http, $scope, $window){
        $scope.layers = [];
        $scope.files = [];
        $scope.files_layer = [];
        $scope.geometry = null;
        $scope.emptyProperties = {};
        $scope.comment = '';
        $scope.url_issues = null;
        $scope.url_layers = null;
        $scope.url_files = null;
        $scope.discussionList = [];
        $scope.community = {name: "Unknown", description: "unknown", schema: []};

        $scope.membership = null;

        $scope.loadedSuccessful = false;

        $scope.invite = {email: ''};

        $scope.url_file_layer = null;
        $scope.file = {
            name: '',
            file: null
        };

        var operations = function(type){
            stoptLoading();
            $scope.loadedSuccessful = type;
            $("#loaded").modal('show');
        };

        $scope.inviteSomeone = function(){
            console.log("Invite: ", $scope.invite.email);
            var data = {
                'email': $scope.invite.email
            };
            var url = url_community + 'invitesomeone/';
            startLoading();

            $http.post(url, data)
                .success(function(data){
                    console.log("You invited someone to the community with successfull!");
                    operations(true);
                    $scope.invite.email = "";
                })
                .error(function(data){
                    console.log("Error to invite user!", data);
                    operations(false);
                    $scope.invite.email = "";
                });
        };

        $scope.joinUs = function(authenticated){
            if(!$scope.community.need_invitation){
                if(authenticated){
                    startLoading();

                    var url = url_community + "joinus/";
                    $http.post(url)
                        .success(function(data){
                            console.log("You joined to community with successfull!");
                            operations(true);
                        })
                        .error(function(){
                            console.log("Error to the join the community!");
                            operations(false);
                        });

                }
                else{
                    var path = $window.location.pathname;
                    $window.location = '/authentication/?next='+path;
                }
            }
        };

        $scope.uploadFile = function(){
            var url = null;
            if($scope.url_file_layer == null){
                url = $scope.url_files;
            }
            else{
                url = $scope.url_file_layer;
                $scope.url_file_layer = null;
            }


            var fd = new FormData();
            for(var key in $scope.file)
                fd.append(key, $scope.file[key]);

            $http.post(url, fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
            .success(function(data){
                    console.log("Success to save file!", data);
            })
            .error(function(data){
                    console.log("Error to save file!", data);
            });

            $scope.files_layer = $scope.files;
            $scope.file.name = '';
            $scome.file.file = null;
        };

        var getProperties = function () {

            var properties = {};
            for(var i=0; i<$scope.community.schema.length; i++){
                var $attr = $("#attribute_"+i);
                var value = null;
                if($attr.attr("type") == "checkbox"){
                    value = $attr.prop("checked");
                }
                else{
                    value = $attr.val();
                }

                properties[$scope.community.schema[i].name_field] = value;
            }

            return properties;
        };

        $scope.showAnswers = function(comment){
            if(comment.answers) return;

            if(comment.reply_count > 0) {
                $http.get(comment.reply)
                    .success(function (data) {
                        console.log(data);
                        comment['answers'] = data;
                    })
                    .error(function () {
                        console.log("Error to load answers");
                    });
            }
        };

        $scope.reply = function(comment){
            var data = {
                'title': '',
                'issue': comment.comment
            };

            $http.post(comment.reply, data)
                .success(function(data){
                    comment.reply_count++;
                    if(comment.answers){
                        comment.answers.push(data);
                    }
                })
                .error(function(){
                    console.log("Error to reply comment!");
                });

            comment.comment = '';
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
                .error(function(){
                    console.log("Error to post comment!");
                });

            $scope.comment = '';
        };

        $scope.clearFilesListLayer = function(){
            $scope.files_layer = $scope.files;
        };

        $scope.prepareToUpload = function(layer){
            $('#upload_file').modal('show');
            var url = layer.feature.properties.files;

            $scope.url_file_layer = url;

            $http.get(url)
                .success(function(data){
                    $scope.files_layer = data;
                }).error(function(){
                    console.log("Error to load files of this instance.");
                    $scope.files_layer = $scope.files;
                });

            console.log(layer);
        };

        $scope.populateForm = function(layer){
            actuallayer = layer;
            var aFeature = layer.feature;

            var properties = angular.fromJson(aFeature.properties.properties);

            for (var i = 0; i < $scope.community.schema.length; i++) {
                var field_name = $scope.community.schema[i].name_field;
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
                $scope.url_layers = data.layers;
                $scope.url_files = data.files;
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
                    .error(function(){
                        console.log("Error to load issues!");
                    });

                $http.get($scope.url_layers)
                    .success(function(data){
                        $scope.layers = data;
                        initializeEditableGeoJson($scope.layers);
                        $.jsontotable(json_properties, { id: '#json_table', header: false });

                    }).error(function(){
                        console.log("Error to load layers data!");
                    });

                $http.get($scope.url_files)
                    .success(function(data){
                        $scope.files = data;
                        $scope.files_layer = $scope.files;
                    })
                    .error(function(){
                        console.log("Erro to load community files!");
                    });

                delete $scope.community.files;
                delete $scope.community.issues;
                delete $scope.community.layer;
            })
            .error(function(data){
                console.log(data);
            });

        var url = url_community + "membership/";
        $http.get(url)
            .success(function(data){
                $scope.membership = data;
                console.log(data);
            })
            .error(function(){
                console.log("Error to load the data of membership.");
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
