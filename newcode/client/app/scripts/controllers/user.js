'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('UserCtrl', function($http, $stateParams, $mdDialog, $rootScope, $scope) {
        var vm = this;
        var userId = $stateParams.userID;
        vm.user = {};
        vm.lrcs = [];
        vm.likes = 0;
        vm.comments = 0;
        vm.addIntro = addIntro;
        vm.followed = false;
        $scope.$on('introChangeSpread', function(event, msg) {
            vm.user.intro = msg;
        });
        $rootScope.$on('introChange', function(event, msg) {
            $rootScope.$broadcast('introChangeSpread', msg);

        });
        $scope.$on('followersChange', function(event, msg) {
            console.log('msg', msg)
            if (msg) {
                vm.followed = true;

                vm.user.followers.length += 1;
                console.log('vm.user.followers', vm.user.followers.length)
            } else {
                vm.followed = false;

                vm.user.followers.length -= 1;
                console.log('vm.user.followers', vm.user.followers.length)
            }

        });
        vm.follow = follow;

        function follow(id, f) {
            // var f = vm.user.followers.indexOf($rootScope.globals.user._id) < 0;

            $http.post('/user/follow', { id: id, f: f }).then(function(res) {
                if (res.data.status == 'OK') {
                    console.log('f', f)
                    $rootScope.$broadcast('followersChange', !f);
                    $mdDialog.cancel();
                }

            }, function(res) {
                util.errorHandler(res);
            });
        }

        function addIntro(ev, content) {
            $mdDialog.show({
                controller: introController,
                controllerAs: 'vm',
                templateUrl: '../../views/add-intro.tpl.html',
                clickOutsideToClose: true,
                bindToController: true,
                locals: { content: content },
            })

            function introController($mdDialog, $http, $rootScope, content) {
                var vm = this;
                console.log('content', content)
                vm.cancel = function() {
                    $mdDialog.hide();
                }
                if (content) {
                    vm.intro = content;
                }
                vm.submit = function($event) {


                    console.log('vm.intro', vm.intro)
                    $http.post('/user/intro', { intro: vm.intro }).then(function(res) {
                        if (res.data.status == 'OK') {
                            $rootScope.globals.user.intro = vm.intro;
                            $scope.$emit('introChange', vm.intro);
                            $mdDialog.cancel();
                        }

                    }, function(res) {
                        util.errorHandler(res);
                    });
                };
            }
        }


        $http.get('/user/' + userId).then(function(res) {
            if (res.data.status == 'OK') {
                vm.user = res.data.result.user;
                vm.followed = vm.user.followers.indexOf($rootScope.globals.user._id) >= 0;
                console.log('vm.followed', vm.followed)
                console.log('vm.user.followers', vm.user.followers)
                console.log('$rootScope.globals.user._id', $rootScope.globals.user._id)
                console.log(vm.user.followers.indexOf($rootScope.globals.user._id) >= 0)
                vm.lrcs = res.data.result.lrcs;
                vm.likes = res.data.result.likes;
                vm.comments = res.data.result.comments;

            }

        }, function() {

        });


    });
