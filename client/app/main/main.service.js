/**
 * Created by Dimitar on 7/15/2017.
 */
'use strict';
(function() {
  var urlScanFactory = function($resource) {

    return $resource('/api/scan/:id', {
      id: '@id'
    });
  };

  urlScanFactory.$inject = ['$resource'];

  angular.module('phisheduproApp').factory('URLScanFactory',
    urlScanFactory);

}());
