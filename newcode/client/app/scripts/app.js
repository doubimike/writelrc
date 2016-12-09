'use strict';

/**
 * @ngdoc overview
 * @name clientApp
 * @description
 * # clientApp
 *
 * Main module of the application.
 */
angular
    .module('clientApp', [
        'ngAnimate',
        'ngAria',
        'ngCookies',
        'ngMessages',
        'ngResource',
        'ngSanitize',
        'ngTouch',
        'ngMaterial',
        'ui.router'
    ])
    .config(function ($stateProvider, $urlRouterProvider, $mdThemingProvider) {


        var customBlueMap = $mdThemingProvider.extendPalette('light-blue', {
            'contrastDefaultColor': 'light',
            'contrastDarkColors': ['50'],
            '50': 'ffffff'
        });
        $mdThemingProvider.definePalette('customBlue', customBlueMap);
        $mdThemingProvider.theme('default')
            .primaryPalette('customBlue', {
                'default': '500',
                'hue-1': '50'
            })
            .accentPalette('yellow');
        $mdThemingProvider.theme('input')
            .primaryPalette('grey');

        $urlRouterProvider.otherwise('/main');
        $stateProvider.state('main', {
                url: '/main',
                templateUrl: 'views/main.html',
                controller: 'MainCtrl',
                controllerAs: 'main'
            })
            .state('about', {
                url: '/about',
                templateUrl: 'views/about.html',
                controller: 'AboutCtrl',
                controllerAs: 'about'
            })
            .state('register', {
                url: '/register',
                templateUrl: 'views/register.html',
                controller: 'RegisterCtrl',
                controllerAs: 'vm'
            })
            .state('login', {
                url: '/login',
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl',
                controllerAs: 'vm'
            })
            .state('afterLogin', {
                url: '/after-login',
                templateUrl: 'views/after-login.html',
                controller: 'AfterLoginCtrl',
                controllerAs: 'vm'
            })
            .state('write', {
                url: '/write',
                templateUrl: 'views/write.html',
                controller: 'WriteCtrl',
                controllerAs: 'vm'
            })
            .state('detail', {
                url: '/detail/:lrcID',
                templateUrl: 'views/detail.html',
                controller: 'DetailCtrl',
                controllerAs: 'vm'
            })
            .state('user', {
                url: '/user/:userID',
                templateUrl: 'views/user.html',
                controller: 'UserCtrl',
                controllerAs: 'vm'
            })
            .state('forgotPass', {
                url: '/forgot-pass',
                templateUrl: 'views/forgot-pass.html',
                controller: 'ForgotPassCtrl',
                controllerAs: 'vm'
            })
            .state('resetPass', {
                url: '/reset-pass',
                templateUrl: 'views/reset-pass.html',
                controller: 'ResetPassCtrl',
                controllerAs: 'vm'
            })
            .state('test', {
                url: '/test',
                templateUrl: 'views/test.html',
                controller: 'TestCtrl',
                controllerAs: 'vm'
            });
    })
    .run(function ($rootScope, $cookieStore, $location) {
        $rootScope.globals = $cookieStore.get('globals') || {};
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            var path = $location.path();
            var restrictedPage = (path === '/test');
            var loggedIn = $rootScope.globals.user;
            if (restrictedPage && !loggedIn) {
                return $location.path('/login');
            }
            if (loggedIn) {
                if (path == '/login' || path == '/register') {
                    $location.path('/after-login');
                }
            }

        });
    }).controller('LogoutCtrl', function ($http, $rootScope, $cookieStore, $state) {
        var vm = this;
        vm.logout = logout;

        function logout() {
            $http.get('/logout').then(function (data) {
                if (data.status == 200) {
                    $rootScope.globals = {};
                    $cookieStore.remove('globals');
                    $state.go('main');
                }
            }, function (data) {
                console.log(data);
            });
        }
    });
