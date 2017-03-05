(function () {
    'use strict';
    angular.module('app')
        .controller('LayoutCtrl', LayoutCtrl);

    function LayoutCtrl($scope, $mdDialog) {

        var fn = {}, data = {};
        $scope.fn = fn;
        $scope.data = data;

        data.settings = {
            printLayout: true,
            showRuler: true,
            showSpellingSuggestions: true,
            presentationMode: 'edit'
        };

        fn.sampleAction = function (name, ev) {
            $mdDialog.show($mdDialog.alert()
                .title(name)
                .textContent('You triggered the "' + name + '" action')
                .ok('Great')
                .targetEvent(ev)
            );
        };

    }
})();
