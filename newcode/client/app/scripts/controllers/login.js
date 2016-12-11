'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('LoginCtrl', function($http, $rootScope, $state, $cookieStore, $scope) {
        var vm = this;
        vm.log = log;

        function log(valid) {
            if (valid) {
                $http.post('/log', {
                    email: vm.user.email,
                    password: vm.user.password
                }).then(function(data) {
                    if (data.status == 200) {
                        // 设置全局变量
                        $rootScope.globals.user = data.data.result;
                        $cookieStore.put('globals', $rootScope.globals);
                        $state.go('afterLogin');
                    }
                }, function(data) {
                    console.log(data);
                    if (data.data.error.error_code == 40003) {
                        vm.emailError = true;
                        alert(data.data.error.error_message);
                    }
                    if (data.data.error.error_code == 40004) {
                        alert(data.data.error.error_message);
                    }

                });
            }
        }
    });
