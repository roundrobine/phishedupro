'use strict';
(function() {

  var MainCtrl = function ($scope, socket, Auth, currentUser, URLScanFactory) {
    var vm = this;
    vm.isAuthenticated = Auth.isLoggedIn;
    vm.isAdmin = Auth.isAdmin;
    vm.currentUser = currentUser;
    vm.scan = {url:"", target:null};


    vm.scanUrl = function () {
      vm.scan.owner = vm.currentUser._id;
      URLScanFactory.save(vm.scan, function (scanReport) {
        console.log(scanReport);
      });
    };

  };

  MainCtrl.$inject = ['$scope','socket', 'Auth', 'currentUser', 'URLScanFactory'];

  angular.module('phisheduproApp')
    .controller('MainCtrl', MainCtrl);

}());

