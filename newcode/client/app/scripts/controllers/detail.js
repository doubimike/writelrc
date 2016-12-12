'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('DetailCtrl', function($http, $stateParams, $rootScope, $state) {
        var vm = this;
        var id = $stateParams.lrcID;
        console.log(id);

        vm.lrc = {};
        vm.like = like;
        vm.likeByUser = false;
        init();


        function init() {
            $http.get('/lrc/detail/' + id).then(function(res) {
                console.log(res)
                if (res.status == 200) {
                    vm.lrc = res.data;
                    vm.likeByUser = vm.lrc.likeIds.indexOf($rootScope.globals.user._id) > -1;
                    console.log('vm.likeByUser', vm.likeByUser)
                    console.log('vm.lrc.likeIds', vm.lrc.likeIds)
                    console.log('$rootScope.globals.user', $rootScope.globals.user)
                }
            }, function(res) {
                console.log('')

            });
        };

        function like() {
            if (!$rootScope.globals.user) {
                return $state.go('login');
            }
            $http.post('/lrc/like/' + id, { likeOrUnlike: !vm.likeByUser }).then(function(res) {
                console.log('res', res)
                if (res.data.status == 'OK') {
                    vm.likeByUser = !vm.likeByUser;
                    if (vm.likeByUser) {
                        vm.lrc.likes = vm.lrc.likes + 1;
                    } else {
                        vm.lrc.likes = vm.lrc.likes - 1;
                    }

                    console.log('vm.likeByUser', vm.likeByUser)

                }

            }, function(res) {

            });
        }

    });
