'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('SearchCtrl', function ($stateParams, $http) {
        var vm = this;
        vm.lrcs = [];
        var searchContent = $stateParams.content;
        vm.searchContent = searchContent;
        vm.searched = false;
        if (searchContent) {
            $http.post('/lrc/search', { search: searchContent }).then(function (res) {
                if (res.data.status == 'OK') {
                    vm.lrcs = res.data.result.lrcs;
                    vm.searched = true;
                }

            }, function (res) {
                util.errorHandler(res);
            });
        }

    }).filter('highlight', function ($sce) {
        return function (input, option1) {
            if (option1) {
                input = input.replace(new RegExp('(' + option1 + ')', 'gi'), '<span class="highlighted">$1</span>');
            }
            console.log('input', input)
            return $sce.trustAsHtml(input);
        }
    });
