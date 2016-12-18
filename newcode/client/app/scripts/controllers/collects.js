'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('CollectCtrl', function($http) {
        var vm = this;
        vm.lrcs = [];
        $http.get('/lrc/collects').then(function(res) {
            if (res.data.status == 'OK') {
                vm.lrcs = res.data.result.lrcs;
            }

        }, function(res) {
            util.errorHandler(res);
        });
    });
