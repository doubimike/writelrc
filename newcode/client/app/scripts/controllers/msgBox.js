'use strict';
angular.module('clientApp')
    .controller('msgBoxCtrl', function ($rootScope, $state, $http, $cookieStore) {
        var vm = this;
        console.log($rootScope.globals.user)
        vm.msgs = $rootScope.globals.user.msgBox;
        vm.readMsg = readMsg;

        function readMsg(readed, lrcId, msgId, index) {
            if (!readed) {

                $http.post('/user/msg/read', { msgId: msgId }).then(function (res) {
                    if (res.data.status == 'OK') {
                        // 设置全局变量
                        console.log('readed')
                        console.log('index', index)
                        $rootScope.globals.user.msgBox[index].readed = true;
                        $cookieStore.put('globals', $rootScope.globals);
                        console.log('$rootScope.globals.user.msgBox', $rootScope.globals.user.msgBox)
                        $state.go('detail', { lrcID: lrcId });
                    }
                }, function (res) {
                    uitl.errorHandler(res);
                });
            } else {
                console.log(lrcId)
                $state.go('detail', { lrcID: lrcId });
            }
        }


    });
