'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('FollowersCtrl', function ($http, $stateParams, $rootScope) {

        var vm = this;
        var id = $stateParams.id;
        vm.users = [];
        vm.follow = follow;
        vm.followed = false;
        // 访问页面的是不是自己
        vm.ifSelf = $rootScope.globals.user._id === id;
        vm.selfId = $rootScope.globals.user._id;
        vm.targetId = id;

        function follow(id, f, ev) {
            // var f = vm.user.followers.indexOf($rootScope.globals.user._id) < 0;
            ev.stopPropagation();
            $http.post('/user/follow', { id: id, f: f }).then(function (res) {
                if (res.data.status == 'OK') {
                    console.log('f', f)
                    vm.followed = true;
                    // $rootScope.$broadcast('followersChange', !f);
                    $mdDialog.cancel();
                }

            }, function (res) {
                util.errorHandler(res);
            });
        }
        $http.get('/user/followers?id=' + id).then(function (res) {
            if (res.data.status == 'OK') {
                vm.user = res.data.result.user;
            }

        }, function (res) {
            util.errorHandler(res);
        });
    });
