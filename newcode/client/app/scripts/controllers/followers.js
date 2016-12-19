'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('FollowersCtrl', function ($http, $stateParams) {

        var vm = this;
        var id = $stateParams.id;
        vm.users = [];
        console.log(id)
        $http.get('/user/followers?id=' + id).then(function (res) {
            if (res.data.status == 'OK') {
                vm.user = res.data.result.user;
            }

        }, function (res) {
            util.errorHandler(res);
        });
    });
