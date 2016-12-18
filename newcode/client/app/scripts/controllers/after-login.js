'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('AfterLoginCtrl', function($http, $rootScope) {
        var vm = this;
        vm.lrcList = [];
        vm.lrcs = [];

        $http.get('/lrc/all').then(function(res) {
            console.log(res)
            vm.lrcList = res.data.lrcList;
        }, function(res) {
            alert('失败，请重试。具体信息：' + JSON.stringify(res));
        })
        vm.loadMore = function() {

            $http.get('/lrc/all').then(function(res) {
                console.log(res);

                vm.lrcList = res.data;
            }, function(res) {
                alert('失败，请重试。具体信息：' + JSON.stringify(res));
            })
        }
        if (!$rootScope.globals.user) {
            // return $state.go('login');
        } else {
            loadMine();
        }

        function loadMine() {
            $http.get('/lrc/mine').then(function(res) {
                console.log(res);

                vm.lrcs = res.data.result.lrcs;
                console.log('vm.lrcs', vm.lrcs)
            }, function(res) {
                alert('失败，请重试。具体信息：' + JSON.stringify(res));
            });
        };
    });
