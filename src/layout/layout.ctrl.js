(function () {
    'use strict';
    angular.module('app')
        .controller('LayoutCtrl', LayoutCtrl);

    function LayoutCtrl($scope, $mdDialog, $mdSidenav, $window) {

        var fn = {}, data = {};
        $scope.fn = fn;
        $scope.data = data;
        $mdSidenav("left").open();

        fn.start = function () {
            data.marginLeft = {'margin-left': '320px'};
            data.nodes = [];
        };

        fn.start();

        data.settings = {
            printLayout: true,
            showRuler: true,
            showSpellingSuggestions: true,
            presentationMode: 'edit',
            sideNav: true
        };

        fn.actions = function (name, ev) {

            if(name == 'addNode'){
                fn.addNode();
            }

            $mdDialog.show($mdDialog.alert()
                .title(name)
                .textContent('You triggered the "' + name + '" action')
                .ok('Great')
                .targetEvent(ev)
            );
        };

        $scope.$watch('data.settings.sideNav', function () {
            if (data.settings.sideNav) {
                $mdSidenav("left").open();
                data.marginLeft = {'margin-left': '320px'};
            } else {
                $mdSidenav("left").close();
                data.marginLeft = {'margin-left': '0px'};
            }
        });

        document.body.onkeydown = function (e) {
            console.log(e.keyCode);
        };

        fn.addNode = function () {
            if (data.nodes.length <= 0) {
                data.nodes.push("A");
            } else {
                data.nodes.push(String.fromCharCode(data.nodes[data.nodes.length - 1].charCodeAt(0) + 1));
            }
        };

    }
})();
