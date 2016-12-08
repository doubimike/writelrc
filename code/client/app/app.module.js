'use strict';

/**
 * @ngdoc overview
 * @name backupyongApp
 * @description
 * # backupyongApp
 *
 * Main module of the application.
 */
angular
    .module('backupyongApp', [
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'backupyongApp.register',
        'backupyongApp.login',
    ])
    .config(function ($routeProvider, $locationProvider) {
        // $locationProvider.html5Mode(true);

        $routeProvider
            .when('/', {
                templateUrl: 'components/home/main.html',
                controller: 'MainCtrl',
                controllerAs: 'vm',
                access: { restricted: true },
                resolve: {
                    test: function () {
                        return 'testaa';
                    }
                }
            })
            .when('/logout', {
                controller: 'logoutController',
                access: { restricted: true }
            })
            .when('/test', {
                template: 'test',
                access: { restricted: false }
            })
            .when('/register', {
                templateUrl: 'components/register.template.html',
                controller: 'registerController',
                access: { restricted: false }
            })
            .when('/login', {
                templateUrl: 'components/login.template.html',
                controller: 'loginController',
                access: { restricted: false }
            })
            .otherwise({
                redirectTo: '/login'
            });
    })
    .controller('logoutController', ['$scope', '$location', 'AuthService',
        function ($scope, $location, AuthService) {

            $scope.logout = function () {

                // call logout from service
                AuthService.logout()
                    .then(function () {
                        $location.path('/login');
                    });

            };
        }
    ])

.run(function ($rootScope, $location, $route, AuthService) {
    $rootScope.$on('$routeChangeStart',
        function (event, next, current) {
            AuthService.getUserStatus()
                .then(function () {
                    if (next.access.restricted && !AuthService.isLoggedIn()) {
                        $location.path('/login');
                        $route.reload();
                    }
                });
        });
});
