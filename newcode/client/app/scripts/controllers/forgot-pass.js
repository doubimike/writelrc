'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
    .controller('ForgotPassCtrl', function ($http) {
        var vm = this;
        vm.submit = submit;

        function submit(valid) {
            console.log('submit')
            if (valid) {
                $http.post('/forgotPass', { email: vm.email }).then(function (res) {
                    if (res.data.status == 'OK') {
                        alert('已发送重置密码到您的邮件。')
                    }

                }, function (res) {
                    util.errorHandler(res);
                });


            }
        }
    });
