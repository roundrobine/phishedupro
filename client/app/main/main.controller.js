'use strict';
(function() {

  var MainCtrl = function ($scope, socket, Auth, URLScanFactory) {
    var vm = this;
    vm.isAuthenticated = Auth.isLoggedIn;
    vm.isAdmin = Auth.isAdmin;


    vm.scanUrl = function () {

      URLScanFactory.save(vm.url, function (scanReport) {
        console.log(scanReport);
      });
    };

  };

  MainCtrl.$inject = ['$scope','socket', 'Auth', 'URLScanFactory'];

  angular.module('phisheduproApp')
    .controller('MainCtrl', MainCtrl);

}());

