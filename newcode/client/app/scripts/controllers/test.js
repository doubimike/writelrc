'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('TestCtrl', function ($scope) {
        var vm = this;
        console.log('ttt')

        // create a new time variable with the current date
        vm.time = new Date();
        vm.test = 'test'
    })
