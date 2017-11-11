'use strict';

angular.module('phisheduproApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('rules', {
        url: '/rules',
        templateUrl: 'app/rules/rules.html',
        controller: 'RulesCtrl',
        controllerAs: 'vm',
        authenticate: 'admin'
      })
      .state('ruledetails', {
        url: '/rules/:id',
        templateUrl: 'app/rules/rule-details.html',
        controller: 'RuleDetailsCtrl',
        controllerAs: 'vm',
        authenticate: 'admin'
    });
  });
