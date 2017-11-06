'use strict';

angular.module('phisheduproApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('rules', {
        url: '/rules',
        templateUrl: 'app/rules/rules.html',
        controller: 'RulesCtrl'
      });
  });
