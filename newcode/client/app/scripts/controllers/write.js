'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('WriteCtrl', function($http, $state) {
        var vm = this;
        vm.write = write;

        function write(valid) {
            if (valid) {
                $http.post('/lrc/write', {
                    title: vm.title,
                    content: vm.content,
                    bg: vm.bg,
                }).then(function(data) {
                    console.log(data)
                    if (data.status == 200) {
                        alert('成功');
                        $state.go('detail', { lrcID: data.data.lrc._id });
                    }
                }, function(data) {
                    console.log(data);
                });
            }
        }


    });
