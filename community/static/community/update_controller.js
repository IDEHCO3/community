(function(){

    var app = angular.module("updateApp",[]).config(function($interpolateProvider) {
        $interpolateProvider.startSymbol('{$');
        $interpolateProvider.endSymbol('$}');
    }).run(run);

    run.$inject = ['$http'];
    function run($http){
        $http.defaults.xsrfHeaderName = 'X-CSRFToken';
        $http.defaults.xsrfCookieName = 'csrftoken';
    }

    app.updateController = function($scope, $http, $window){

        $scope.communityName = "";
        $scope.description = "";
        $scope.needInvitation = false;
        

        $scope.attributes = [];

        $scope.layerType = 'point';
        $scope.type_field_pk = null;
        $scope.attributeName = '';
        $scope.attributeType = 'CharField';

        var deleted_list = [];

        $http.get(url_update_community)
            .success(function(data){
                $scope.communityName = data.name;
                $scope.description = data.description;
                $scope.needInvitation = data.need_invitation;
            })
            .error(function(data){
                console.log(data);
            });

        $http.get(url_load_schema)
            .success(function(data){
                for(var i=0; i<data.length; i++){
                    data[i]['pk'] = data[i]['id'];
                    data[i]['id'] = i;

                    if(data[i].name_field == 'geometry'){
                        $scope.layerType = data[i].type_field;
                        $scope.type_field_pk = data[i].pk;
                    }
                    else{
                        $scope.attributes.push(data[i]);
                    }
                }
            })
            .error(function(data){
                console.log(data);
            });

        $scope.createAttribute = function(){

            if( $scope.attributeName === '' )
                return;

            var attr = {id: $scope.attributes.length,
                        pk: null,
                        name_field: $scope.attributeName,
                        type_field: $scope.attributeType};

            $scope.attributes.push(attr);

            $scope.attributeName = '';
            $scope.attributeType = 'CharField';
        };

        $scope.removeAttribute = function(index){
            deleted_list.push($scope.attributes[index]);
            $scope.attributes.splice(index,1);

            for(var i=0; i < $scope.attributes.length; i++){
                $scope.attributes[i]['id'] = i;
            }
        };

        var saveLayerType = function(community){
            var attribute = {
                "id": $scope.type_field_pk,
                "name_field": "geometry",
                "type_field": $scope.layerType,
                "name_module_field": "",
                "options": "{}",
                "community": community.id
            };

            var local_url = schema_url_update + attribute.id + "/";

            $http.put(local_url, attribute)
                .success(function(data){
                    console.log(data);
                })
                .error(function(data){
                    console.log(data);
                });

        };

        var delete_attributes = function(){
            for(var i=0; i<deleted_list.length; i++){
                var local_url = schema_url_update + deleted_list[i].pk + "/";

                $http.delete(local_url)
                    .success(function(data){
                        console.log(data);
                    })
                    .error(function(data){
                        console.log(data);
                    });
            }
        }

        var saveLayerSchema = function(community){
            console.log(community);

            saveLayerType(community);
            delete_attributes();

            for(var i=0; i < $scope.attributes.length; i++){

                var attr = $scope.attributes[i];
                if(attr.pk != null) continue;

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

        $scope.update = function(){
            var community_input = {
                "name": $scope.communityName,
                "description": $scope.description,
                "need_invitation": $scope.needInvitation,
                "manager": user_id
            };

            $http.put(url_update_community, community_input)
                .success(function(data){
                    saveLayerSchema(data);
                })
                .error(function(data){
                    console.log(data);
                });
        };
    };

    app.controller("UpdateController",['$scope', '$http', '$window', app.updateController]);

})();