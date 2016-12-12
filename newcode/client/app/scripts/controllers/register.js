'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('RegisterCtrl', function ($http, $state, $rootScope, $cookieStore) {
        var vm = this;

        vm.reg = reg;

        function reg(valid) {
            console.log('valid', valid)
            if (valid) {
                $http.post('/reg', { name: vm.user.name, email: vm.user.email, password: vm.user.password }).then(function (res) {
                    if (res.data.status == 'OK') {
                        // 设置全局变量

                        $rootScope.globals.user = res.data.result;
                        console.log('$rootScope.globals.user', $rootScope.globals.user);
                        $cookieStore.put('globals', $rootScope.globals);
                        $state.go('afterLogin');
                    }
                }, function (res) {
                    console.log(res);
                    alert(JSON.stringify(res));
                });
            }
        }
    });
