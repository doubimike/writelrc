'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('DetailCtrl', function ($http, $stateParams, $rootScope, $state, $mdDialog, $scope) {
        var vm = this;
        var id = $stateParams.lrcID;
        var comparescope = $scope;
        vm.lrc = {};
        vm.like = like;
        vm.likeByUser = false;
        vm.comments = [];
        vm.addComment = addComment;
        init();
        $scope.$on('commentsChange', function (event, msg) {
            console.log('msg', msg);

        })



        function init() {
            $http.get('/lrc/detail/' + id).then(function (res) {
                console.log(res)
                if (res.status == 200) {
                    vm.lrc = res.data;
                    vm.likeByUser = vm.lrc.likeIds.indexOf($rootScope.globals.user._id) > -1;
                    console.log('vm.likeByUser', vm.likeByUser)
                    console.log('vm.lrc.likeIds', vm.lrc.likeIds)
                    console.log('$rootScope.globals.user', $rootScope.globals.user)
                }
            }, function (res) {
                console.log('')

            });
        };

        function like() {
            if (!$rootScope.globals.user) {
                return $state.go('login');
            }
            $http.post('/lrc/like/' + id, { likeOrUnlike: !vm.likeByUser }).then(function (res) {
                console.log('res', res)
                if (res.data.status == 'OK') {
                    vm.likeByUser = !vm.likeByUser;
                    if (vm.likeByUser) {
                        vm.lrc.likes = vm.lrc.likes + 1;
                    } else {
                        vm.lrc.likes = vm.lrc.likes - 1;
                    }

                    console.log('vm.likeByUser', vm.likeByUser)

                }

            }, function (res) {

            });
        }

        function addComment(ev) {
            var dom = document.getElementById('detail');

            var parentEl = angular.element(dom);
            console.log(parentEl)
            $mdDialog.show({
                parent: parentEl,
                controller: CommentCtrl,
                controllerAs: 'vm',
                templateUrl: '../../views/comment.tpl.html',
                clickOutsideToClose: true,
            });

            function CommentCtrl($mdDialog, $scope) {

                var vm = this;
                vm.cancel = function () {
                    $mdDialog.cancel();
                };
                vm.submit = function (valid) {
                    if (valid) {
                        $http.post('/lrc/comment', {
                            lrcId: id,
                            content: vm.comment.content
                        }).then(function (res) {
                            if (res.data.status == 'OK') {
                                // $scope.vm.lrc.comments = [];
                                console.log('res.data.result', res.data.result)
                                $scope.$emit('commentsChange', res.data.result)
                                    // console.log('$scope.vm.lrc.comments', $scope.vm.lrc.comments)
                                $mdDialog.cancel();
                            }

                        }, function (res) {
                            util.errorHandler(res);
                        });
                    }
                };
            }
        }




    });
