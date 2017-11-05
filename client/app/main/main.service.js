/**
 * Created by Dimitar on 7/15/2017.
 */
'use strict';
(function() {
  var urlScanFactory = function($resource) {

    return $resource('/scan/:controller/:id', {
      id: '@id'
    }, {
      stats: {
        method:'GET',
        params: {
          controller:'stats'
        }
      }
    });
  };

  urlScanFactory.$inject = ['$resource'];

  angular.module('phisheduproApp').factory('URLScanFactory',
    urlScanFactory);

}());
