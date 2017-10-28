'use strict';
(function() {

  var MainCtrl = function ($scope, socket, Auth, currentUser, URLScanFactory) {
    var vm = this;
    vm.isAuthenticated = Auth.isLoggedIn;
    vm.isAdmin = Auth.isAdmin;
    vm.currentUser = currentUser;
    vm.scan = {url:"", target:null};
    vm.scanResults = {};

    const PHISHING_CLASS = {
      LEGITIMATE: 1,
      SUSPICIOUS: 0,
      PHISHING: -1
    }
    const PHISHING_CLASS_TEXT = {
      LEGITIMATE: "Legitimate",
      SUSPICIOUS: "Suspicious",
      PHISHING: "Phishing"
    }


    vm.scanUrl = function () {
      vm.scan.owner = vm.currentUser._id;
      URLScanFactory.save(vm.scan, function (scanReport) {
        console.log(scanReport);
        vm.scanResults = scanReport;
      }, function(error) {
        console.log(error);
      });
    };

    vm.applyCollor = function (value) {
      let phishingClass = "";
      switch (value){
        case PHISHING_CLASS.LEGITIMATE:
          phishingClass = "badge-success"
          break;
        case PHISHING_CLASS.SUSPICIOUS:
          phishingClass = "badge-warning"
          break;
        case PHISHING_CLASS.PHISHING:
          phishingClass = "badge-danger"
          break;
        default:
          phishingClass = "badge-info"
      }
      return phishingClass;
    };

    vm.phishingClass = function (value) {
      let phishingClass = "";
      switch (value){
        case PHISHING_CLASS.LEGITIMATE:
          phishingClass = PHISHING_CLASS_TEXT.LEGITIMATE
          break;
        case PHISHING_CLASS.SUSPICIOUS:
          phishingClass = PHISHING_CLASS_TEXT.SUSPICIOUS
          break;
        case PHISHING_CLASS.PHISHING:
          phishingClass = PHISHING_CLASS_TEXT.PHISHING
          break;
        default:
          phishingClass = "Unknown"
      }
      return phishingClass;
    };

  };

  MainCtrl.$inject = ['$scope','socket', 'Auth', 'currentUser', 'URLScanFactory'];

  angular.module('phisheduproApp')
    .controller('MainCtrl', MainCtrl);

}());

