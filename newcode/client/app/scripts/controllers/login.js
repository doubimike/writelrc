'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('LoginCtrl', function ($http, $rootScope, $state, $cookieStore, $scope) {
        var vm = this;
        vm.log = log;

        function log(valid) {
            if (valid) {
                $http.post('/log', {
                    email: vm.user.email,
                    password: vm.user.password
                }).then(function (res) {
                    console.log(res);
                    if (res.data.error_code == 40003) {
                        vm.emailError = true;
                        // alert(res.data.error_message);
                    }
                    if (res.data.error_code == 40004) {
                        // alert(res.data.error_message);
                    }

                    if (res.data.status == 'OK') {
                        // 设置全局变量
                        $rootScope.globals.user = res.data.result;
                        $cookieStore.put('globals', $rootScope.globals);
                        $state.go('discovery');
                    }
                }, function (res) {
                    uitl.errorHandler(res);
                });
            }
        }
    });
