'use strict';
angular.module('clientApp')
    .controller('resetPassByEmailCtrl', function ($stateParams, $http) {
        var vm = this;
        var token = $stateParams.token;
        vm.submit = submit;

        function submit(valid) {
            console.log('submit')
            if (valid) {
                $http.put('/user/resetPasswordByEmail', { newPass: vm.newPass, token: token }).then(function (res) {
                    if (res.data.status == 'OK') {
                        alert('成功');
                    }

                }, function (res) {
                    util.errorHandler(res);
                });


            }
        }
    });
