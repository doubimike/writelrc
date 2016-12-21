'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('discoveryCtrl', function ($http, $rootScope) {
        var vm = this;
        vm.lrcList = [];
        vm.lrcs = [];
        vm.tabNew = tabNew;
        vm.newLrcList = [];
        vm.tabNewAlready = false;

        function tabNew() {
            if (!vm.tabNewAlready) {

                $http.get('/lrc/all', {
                    params: { 'sort': 'publishTime' }
                }).then(function (res) {
                    vm.tabNewAlready = true;
                    vm.newLrcList = res.data.lrcList;
                }, function (res) {
                    alert('失败，请重试。具体信息：' + JSON.stringify(res));
                });
            } else {

            }
        }

        $http.get('/lrc/all').then(function (res) {
            vm.lrcList = res.data.lrcList;
        }, function (res) {
            alert('失败，请重试。具体信息：' + JSON.stringify(res));
        });
        vm.loadMore = function (tag) {
            if (tag !== 'new') {
                $http.get('/lrc/all', {
                    params: {
                        'index': vm.lrcList.length
                    }
                }).then(function (res) {
                    var newLrcs = res.data.lrcList;
                    if (newLrcs.length < 10) {
                        vm.hideLoadMoreLrcs = true;
                    }
                    for (var i = 0; i < newLrcs.length; i++) {
                        vm.lrcList.push(newLrcs[i]);
                    }

                }, function (res) {
                    alert('失败，请重试。具体信息：' + JSON.stringify(res));
                });
            } else {
                $http.get('/lrc/all', {
                    params: {
                        'index': vm.newLrcList.length,
                        'sort': 'publishTime'
                    }
                }).then(function (res) {
                    var newLrcs = res.data.lrcList;
                    if (newLrcs.length < 10) {
                        vm.hideLoadMoreNewLrcs = true;
                    }
                    for (var i = 0; i < newLrcs.length; i++) {
                        vm.newLrcList.push(newLrcs[i]);
                    }

                }, function (res) {
                    alert('失败，请重试。具体信息：' + JSON.stringify(res));
                });
            }

        };
        if (!$rootScope.globals.user) {
            // return $state.go('login');
        } else {
            loadMine();
        }

        function loadMine() {
            $http.get('/lrc/mine').then(function (res) {

                vm.lrcs = res.data.result.lrcs;
            }, function (res) {
                alert('失败，请重试。具体信息：' + JSON.stringify(res));
            });
        };
    });
