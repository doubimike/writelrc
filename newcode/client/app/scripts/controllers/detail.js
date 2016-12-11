'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('DetailCtrl', function($http, $stateParams, $rootScope) {
        var vm = this;
        var id = $stateParams.lrcID;
        console.log(id);

        vm.lrc = {};
        vm.like = like;
        init();


        function init() {
            $http.get('/lrc/' + id).then(function(data) {
                console.log(data)
                if (data.status == 200) {
                    vm.lrc = data.data;
                }
            }, function(data) {
                console.log(data);
            })
        };

        function like() {
            if (!$rootScope.globals.user) {
                $state.go('login');
            }
        }

    });
