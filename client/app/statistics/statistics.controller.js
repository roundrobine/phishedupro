'use strict';
(function() {

  var StatisticsCtrl = function ($scope, socket, Auth, URLScanFactory) {

    var vm = this;
    vm.isAuthenticated = Auth.isLoggedIn;
    vm.isAdmin = Auth.isAdmin;
    vm.statistics = null;

    vm.getStatistics = function () {
      URLScanFactory.stats(function (report) {
        console.log(report);
        vm.statistics = report;
      }, function(error) {
        console.log(error);
      });
    };


    vm.getStatistics();

  };

  StatisticsCtrl.$inject = ['$scope','socket', 'Auth',  'URLScanFactory'];

  angular.module('phisheduproApp')
    .controller('StatisticsCtrl', StatisticsCtrl);

}());

