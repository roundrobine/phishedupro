'use strict';
(function() {

  var MainCtrl = function ($scope, socket, Auth, currentUser, URLScanFactory) {
    var vm = this;
    vm.isAuthenticated = Auth.isLoggedIn;
    vm.isAdmin = Auth.isAdmin;
    vm.currentUser = currentUser;
    vm.scan = {url:"", target:null};
    vm.scanResults = null;

    const PHISHING_CLASS = {
      LEGITIMATE: 1,
      SUSPICIOUS: 0,
      PHISHING: -1
    };
    const PHISHING_CLASS_TEXT = {
      LEGITIMATE: "Legitimate",
      SUSPICIOUS: "Suspicious",
      PHISHING: "Phishing"
    };

    const PHISHING_CATEGORIES = {
      VERY_LEGITIMATE: 0,
      LEGITIMATE: 20,
      FAIR: 40,
      VERY_SUSPICIOUS: 50,
      PHISHING: 60
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

    vm.applyProgressBarColor = function (finalScore) {
      let phishingClass = {};
      if(finalScore >= PHISHING_CATEGORIES.VERY_LEGITIMATE && finalScore <= PHISHING_CATEGORIES.LEGITIMATE){
        phishingClass.cssClass = "progress-bar-very-legitimate";
        phishingClass.label = "Very Legitimate";
      }
      else if(finalScore > PHISHING_CATEGORIES.LEGITIMATE && finalScore <= PHISHING_CATEGORIES.FAIR){
        phishingClass.cssClass = "progress-bar-success";
        phishingClass.label = "Legitimate";
      }
      else if(finalScore > PHISHING_CATEGORIES.FAIR && finalScore <= PHISHING_CATEGORIES.VERY_SUSPICIOUS){
        phishingClass.cssClass = "progress-bar-fair";
        phishingClass.label = "Fair";
      }
      else if(finalScore > PHISHING_CATEGORIES.VERY_SUSPICIOUS && finalScore <= PHISHING_CATEGORIES.PHISHING){
        phishingClass.cssClass = "progress-bar-warning";
        phishingClass.label = "Very Suspicious";
      }
      else if(finalScore > PHISHING_CATEGORIES.PHISHING){
        phishingClass.cssClass = "progress-bar-danger"
        phishingClass.label = "Phishing";
      }
      else{
        phishingClass.cssClass = "progress-bar-info";
        phishingClass.label = "Unknown";
      }
      return phishingClass;
    }

    vm.formatDate = function (date) {
      return moment(date).format("MMMM Do YYYY, h:mm:ss a");
    }

  };

  MainCtrl.$inject = ['$scope','socket', 'Auth', 'currentUser', 'URLScanFactory'];

  angular.module('phisheduproApp')
    .controller('MainCtrl', MainCtrl);

}());

