'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('WriteCtrl', function($http, $state, $stateParams) {
        var vm = this;
        vm.write = write;
        var lrc = $stateParams.lrc;
        console.log('lrc', lrc);
        if (lrc) {
            var update = true;
            vm.content = lrc.content;
            vm.title = lrc.title;
            vm.bg = lrc.bg;
        }

        function write(valid) {
            if (valid && !update) {
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
            } else if (valid && update) {
                $http.put('/lrc/write', {
                    id: lrc._id,
                    title: vm.title,
                    content: vm.content,
                    bg: vm.bg,
                    updateTime: new Date()
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
