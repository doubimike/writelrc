'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('RegisterCtrl', function($http) {
        var vm = this;

        vm.reg = reg;

        function reg() {
            $http.post('/reg', { name: 'm', email: 'q', password: '1' })
        }

    });
