(function(){
  'use strict';
  angular.module('app')
    .controller('LoadingCtrl', LoadingCtrl);

  function LoadingCtrl($state){

    console.log("lol");

    $state.go('app');

  }
})();
