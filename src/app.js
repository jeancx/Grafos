(function () {
    'use strict';
    angular.module('app', ['ui.router', 'ngMaterial'])
        .config(configBlock)
        .filter('keyboardShortcut', keyboardShortcut);

    function configBlock($stateProvider, $locationProvider, $urlRouterProvider, $mdIconProvider) {

        $mdIconProvider
            .defaultIconSet('img/icons/sets/core-icons.svg', 24);

        $stateProvider
            .state('loading', {
                url: '/loading',
                template: '<md-progress-linear md-mode="indeterminate"></md-progress-linear>',
                controller: 'LoadingCtrl'
            })
            .state('app', {
                url: '/app',
                abstract: false,
                templateUrl: 'src/layout/layout.html',
                controller: 'LayoutCtrl'
            })
            .state('app.funcoes', {
                url: '/funcoes',
                templateUrl: 'src/funcoes/funcoes.html',
                controller: 'FuncoesCtrl',
            })
            .state('app.ajuda', {
                url: '/ajuda',
                templateUrl: 'src/ajuda/ajuda.html',
                controller: 'AjudaCtrl',
            });

        $urlRouterProvider.otherwise('/loading');

    }

    function keyboardShortcut($window) {
        return function (str) {
            return str;
            if (!str) return;
            var keys = str.split('-');
            var isOSX = /Mac OS X/.test($window.navigator.userAgent);

            var seperator = (!isOSX || keys.length > 2) ? '+' : '';

            var abbreviations = {
                M: isOSX ? '⌘' : 'Ctrl',
                A: isOSX ? 'Option' : 'Alt',
                S: 'Shift'
            };

            return keys.map(function (key, index) {
                var last = index == keys.length - 1;
                return last ? key : abbreviations[key];
            }).join(seperator);
        };
    }


})();
