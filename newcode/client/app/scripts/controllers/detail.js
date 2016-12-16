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
        vm.replyComment = replyComment;
        vm.deleteComment = deleteComment;
        init();
        $scope.$on('commentsChangeFound', function (event, msg) {
            vm.lrc.comments.splice(0, 0, msg);
        });
        $scope.$on('commentsDelFound', function (event, msg) {
            vm.lrc.comments.splice(msg, 1);
        });
        $rootScope.$on('commentsChange', function (event, msg) {
            $rootScope.$broadcast('commentsChangeFound', msg);

        });
        $rootScope.$on('commentsDel', function (event, msg) {
            $rootScope.$broadcast('commentsDelFound', msg);

        });

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

        function addComment(ev, tag, authorName) {
            var dom = document.getElementById('detail');
            var parentEl = angular.element(dom);
            $mdDialog.show({
                parent: parentEl,
                controller: CommentCtrl,
                locals: { tag: tag, authorName: authorName },
                bindToController: true,
                controllerAs: 'vm',
                templateUrl: '../../views/comment.tpl.html',
                clickOutsideToClose: true,
            });

            function CommentCtrl($mdDialog, $scope, tag, authorName) {



                var vm = this;
                if (tag == 'reply') {
                    vm.placeholder = '回复: ' + authorName;
                } else {
                    vm.placeholder = '写下你的词评';
                }
                console.log(vm.placeholder, 'vm.placeholder')
                vm.cancel = function () {
                    $mdDialog.cancel();
                };
                vm.submit = function (valid) {
                    if (valid) {
                        var content;
                        if (tag == 'reply') {
                            content = '回复 ' + authorName + ': ' + vm.comment.content;
                        } else {
                            content = vm.comment.content;
                        }
                        $http.post('/lrc/comment', {
                            lrcId: id,
                            content: content
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

        function deleteComment(ev, comment, $index) {
            var confirm = $mdDialog.confirm().title('确定要删除此条评论么？')
                .ok('确定')
                .cancel('取消');
            $mdDialog.show(confirm).then(function () {
                $http.delete('/lrc/comment', { params: { lrcId: id, comment: comment } }).then(function (res) {
                    if (res.data.status == 'OK') {
                        $scope.$emit('commentsDel', $index);
                    }
                }, function (res) {
                    console.log(res);
                })
            }, function () {

            })
        };

        function replyComment($event, authorName) {
            console.log('authorName', authorName)
            addComment($event, 'reply', authorName);
        }


    });
