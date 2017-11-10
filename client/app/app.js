'use strict';

angular.module('phisheduproApp', [
  'phisheduproApp.auth',
  'phisheduproApp.admin',
  'phisheduproApp.constants',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'btford.socket-io',
  'ui.router',
  'ui.bootstrap',
  'validation.match',
  'angularUtils.directives.dirPagination',
  'rzModule'
])
  .config(function($urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  });
