'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('FolloweesCtrl', function ($http, $stateParams) {

        var vm = this;
        var id = $stateParams.id;
        vm.users = [];
        console.log(id)
        $http.get('/user/followees?id=' + id).then(function (res) {
            if (res.data.status == 'OK') {
                vm.user = res.data.result.user;
            }

        }, function (res) {
            util.errorHandler(res);
        });
    });
