'use strict';
(function() {

  var RuleDetailsCtrl = function ($scope, $state, $stateParams, socket, Auth, RulesService, $log) {

    var vm = this;
    vm.isAuthenticated = Auth.isLoggedIn;
    vm.isAdmin = Auth.isAdmin;
    vm.rule = null;
    vm.weightSlider = {
      options: {
        floor: 0,
        ceil: 1,
        step: 0.0001,
        precision: 4
      }
    }

    vm.phishingSlider = {
      options: {
        floor: 0,
        ceil: 750,
        step: 1,
        precision: 1
      }
    }

    vm.suspiciousSlider = {
      options: {
        floor: 0,
        ceil: 750,
        step: 1,
        precision: 1
      }
    }

    RulesService.get({id:$stateParams.id}, function(rule) {
      vm.rule = rule;
      initializeSliders();
    }, function (error) {
      $log.error('Rule fetching failed:', error);
    });

    vm.updateRule = function(form){
      if(form.$valid) {

        RulesService.update({
          id: vm.rule._id
        }, vm.rule, function (rule) {
          vm.rule = rule;
          $log.info('Updated rule:', rule);

          $state.go('rules');

        }, function (error) {
          $log.error('Rule update failed:', error);
        });
      }
    };

    vm.goToRules = function(){
      $state.go('rules');
    };

    function initializeSliders(){
      if(vm.rule.unit === '%'){
        vm.phishingSlider.options.ceil = 100;
        vm.suspiciousSlider.options.ceil = 100;
      }
      else if(vm.rule.unit === 'rank'){
        vm.phishingSlider = null;
        vm.suspiciousSlider.options.floor =1;
        vm.suspiciousSlider.options.ceil =1000000;
      }
      else if(vm.rule.unit === 'PageRank'){
        vm.suspiciousSlider = null;
        vm.phishingSlider.options.ceil =10;
        vm.phishingSlider.options.step = 0.01;
        vm.phishingSlider.options.precision = 2;
      }
      else if(vm.rule.unit === 'days'){
        vm.suspiciousSlider = null;
      }
      else if(vm.rule.code === 'pageAuthority' || vm.rule.code === 'domainAuthority'){
        vm.suspiciousSlider.options.floor =1;
        vm.phishingSlider.options.floor =1;
        vm.phishingSlider.options.ceil = 100;
        vm.suspiciousSlider.options.ceil = 100;
      }
      else if (vm.rule.code === 'externalLinks' || vm.rule.code === "subdomains"){
        vm.suspiciousSlider.options.floor =0;
        vm.phishingSlider.options.floor =0;
        vm.phishingSlider.options.ceil = 20;
        vm.suspiciousSlider.options.ceil = 20;
      }
      else if(!vm.rule.unit){
        vm.phishingSlider = null;
        vm.suspiciousSlider = null;
      }
    };

  };

  RuleDetailsCtrl.$inject = ['$scope', '$state', '$stateParams', 'socket', 'Auth',  'RulesService', '$log'];

  angular.module('phisheduproApp')
    .controller('RuleDetailsCtrl', RuleDetailsCtrl);

}());
