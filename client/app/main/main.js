'use strict';

angular.module('phisheduproApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl',
        controllerAs: 'vm',
        resolve: {
          currentUser: function(Auth) {
            return Auth.getCurrentUser().$promise;
          },
          scans: function(URLScanFactory) {
            return URLScanFactory.paged(
              { page: 1,
                limit: 10,
                sortBy: 'url'}).$promise;
          }
        }
      });
  });
