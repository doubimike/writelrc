'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('DetailCtrl', function($http, $stateParams, $rootScope, $state, $mdDialog, $scope) {
        var vm = this;
        var id = $stateParams.lrcID;
        var comparescope = $scope;
        vm.lrc = {};
        vm.like = like;
        vm.collect = collect;
        vm.likeByUser = false;
        vm.collectByUser = false;
        vm.comments = [];
        vm.addComment = addComment;
        vm.replyComment = replyComment;
        vm.deleteComment = deleteComment;
        vm.deleteLrc = deleteLrc;
        vm.update = update;

        function update(lrc) {
            $state.go('write', { lrc: lrc });
        }
        init();
        $scope.$on('commentsChange', function(event, msg) {
            vm.lrc.comments.splice(0, 0, msg);
        });
        $scope.$on('commentsChangeMore', function(event, msg) {
            console.log('commentsChangeMore')
            console.log('msg', msg)
            console.log(vm.lrc.comments, 'vm.lrc.comments')
            var newComments = msg.comments;
            // 这里会出现等于10的时候得多按一次的bug,先这样处理吧，不想再维护一个评论技术的field，暂时也没找到mongoose更好的解决方案
            if (newComments.length < 10) {
                vm.hideLoadMoreComments = true;
            }
            for (var i = 0; i < newComments.length; i++) {
                console.log('1')
                vm.lrc.comments.push(newComments[i]);
            }
            console.log(vm.lrc.comments, 'vm.lrc.comments')

        });
        $scope.$on('commentsDelFound', function(event, msg) {
            vm.lrc.comments.splice(msg, 1);
        });
        vm.loadMore = loadMore;


        function deleteLrc(id) {
            $http.post('/lrc/delete', { id: id }).then(function(res) {
                if (res.data.status == 'OK') {
                    console.log('ok')
                    alert('成功');
                    $state.go('write');
                }

            }, function(res) {
                util.errorHandler(res);
            });
        }

        function loadMore(id, index) {
            $http.post('/lrc/loadMoreComment', { lrcId: id, index: index }).then(function(res) {
                if (res.data.status == 'OK') {
                    $rootScope.$broadcast('commentsChangeMore', res.data.result)

                }

            }, function(res) {

            });
        }

        function init() {
            $http.get('/lrc/detail/' + id).then(function(res) {
                console.log(res)
                if (res.status == 200) {
                    vm.lrc = res.data;
                    vm.likeByUser = vm.lrc.likeIds.indexOf($rootScope.globals.user._id) > -1;
                    vm.collectByUser = vm.lrc.collectIds.indexOf($rootScope.globals.user._id) > -1;
                    console.log('vm.collectByUser', vm.likeByUser)
                    console.log('vm.lrc.likeIds', vm.lrc.likeIds)
                    console.log('$rootScope.globals.user', $rootScope.globals.user)
                }
            }, function(res) {
                console.log('')

            });
        };

        function like() {
            if (!$rootScope.globals.user) {
                return $state.go('login');
            }
            $http.post('/lrc/like/' + id, { likeOrUnlike: !vm.likeByUser }).then(function(res) {
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

            }, function(res) {

            });
        }

        function collect() {
            if (!$rootScope.globals.user) {
                return $state.go('login');
            }
            $http.post('/lrc/collect/' + id, { collectOrUncollect: !vm.collectByUser }).then(function(res) {
                console.log('res', res)
                if (res.data.status == 'OK') {
                    vm.collectByUser = !vm.collectByUser;
                    if (vm.collectByUser) {
                        vm.lrc.collects = vm.lrc.collects + 1;
                    } else {
                        vm.lrc.collects = vm.lrc.collects - 1;
                    }

                    console.log('vm.collectByUser', vm.collectByUser)

                }

            }, function(res) {

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
                vm.cancel = function() {
                    $mdDialog.cancel();
                };
                vm.submit = function(valid) {
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
                        }).then(function(res) {
                            if (res.data.status == 'OK') {
                                // $scope.vm.lrc.comments = [];
                                console.log('res.data.result', res.data.result)
                                $rootScope.$broadcast('commentsChange', res.data.result)
                                    // console.log('$scope.vm.lrc.comments', $scope.vm.lrc.comments)
                                $mdDialog.cancel();
                            }

                        }, function(res) {
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
            $mdDialog.show(confirm).then(function() {
                $http.delete('/lrc/comment', { params: { lrcId: id, comment: comment } }).then(function(res) {
                    if (res.data.status == 'OK') {
                        $rootScope.$broadcast('commentsDelFound', $index);
                    }
                }, function(res) {
                    console.log(res);
                })
            }, function() {

            })
        };

        function replyComment($event, authorName) {
            console.log('authorName', authorName)
            addComment($event, 'reply', authorName);
        }


    });
