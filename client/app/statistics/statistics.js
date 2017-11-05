'use strict';

angular.module('phisheduproApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('statistics', {
        url: '/statistics',
        templateUrl: 'app/statistics/statistics.html',
        controller: 'StatisticsCtrl',
        controllerAs: 'vm',
      });
  });
