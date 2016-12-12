'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('DetailCtrl', function ($http, $stateParams, $rootScope) {
        var vm = this;
        var id = $stateParams.lrcID;
        console.log(id);

        vm.lrc = {};
        vm.like = like;
        init();


        function init() {
            $http.get('/lrc/detail/' + id).then(function (res) {
                console.log(res)
                if (res.status == 200) {
                    vm.lrc = res.data;
                }
            }, function (res) {
                console.log(res);
            });
        };

        function like() {
            // if (!$rootScope.globals.user) {
            //     $state.go('login');
            // }
            $http.post('/lrc/like/' + id).then(function (res) {
                console.log('like');

            }, function (res) {

            });
        }

    });
