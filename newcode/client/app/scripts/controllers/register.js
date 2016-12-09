'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('RegisterCtrl', function ($http, $state, $rootScope) {
        var vm = this;

        vm.reg = reg;

        function reg() {
            $http.post('/reg', { name: vm.user.name, email: vm.user.email, password: vm.user.password }).then(function (data) {
                if (data.status == 200) {
                    // 设置全局变量

                    $rootScope.globals.user = data.data.result;
                    console.log('$rootScope.globals.user', $rootScope.globals.user);
                    $cookieStore.put('globals', $rootScope.globals);
                    $state.go('afterLogin');
                }
            }, function (data) {
                console.log(data);
            });
        }
    });
