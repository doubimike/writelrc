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
        // 'ngTouch',
        'ngMaterial',
        'ui.router',
        'angularMoment'
    ])
    .factory('errorHandlerInterceptor', function () {
        var errorHandlerInterceptor = {
            response: function (response) {
                if (response.data.status == 'Error') {
                    alert(response.data.error_message);
                }
                return response;
            }
        }
        return errorHandlerInterceptor;
    })
    .config(function ($stateProvider, $urlRouterProvider, $mdThemingProvider, $qProvider, $httpProvider) {
        $httpProvider.interceptors.push('errorHandlerInterceptor');


        $qProvider.errorOnUnhandledRejections(false);

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
    .run(function ($rootScope, $cookieStore, $location, amMoment) {
        amMoment.changeLocale('zh-hk');
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
    }).controller('GeneralCtrl', function GeneralCtrl($mdPanel) {
        var vm = this;
        vm._mdPanel = $mdPanel;
        var panelRef;

        GeneralCtrl.prototype.showMenu = function (ev) {
            var position = vm._mdPanel.newPanelPosition()
                .relativeTo('.menu')
                .addPanelPosition(vm._mdPanel.xPosition.CENTER, vm._mdPanel.yPosition.BELOW);
            var config = {
                attachTo: angular.element(document.body),
                controller: PanelMenuCtrl,
                controllerAs: 'vm',
                templateUrl: '../views/menu.tpl.html',
                panelClass: 'menu-content',
                position: position,
                clickOutsideToClose: true,
                escapeToClose: true,
                focusOnOpen: false,
                zIndex: 2
            };

            vm._mdPanel.open(config).then(function (result) {
                panelRef = result;
            });

        }

        function PanelMenuCtrl(mdPanelRef) {
            this._mdPanelRef = mdPanelRef;
        }

        PanelMenuCtrl.prototype.closeMenu = function () {
            var panelRef = this._mdPanelRef;
            panelRef && panelRef.close().then(function () {
                panelRef.destroy();
            });
        }

        GeneralCtrl.prototype.closeMenu = function () {
            console.log('closeMenu')
            console.log(panelRef)
            panelRef && panelRef.close().then(function () {
                // angular.element(document.querySelector('.menu')).focus();
                panelRef.destroy();
            });
        };

    });
