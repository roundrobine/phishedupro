'use strict';

angular.module('phisheduproApp.auth', [
  'phisheduproApp.constants',
  'phisheduproApp.util',
  'ngCookies',
  'ui.router'
])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
