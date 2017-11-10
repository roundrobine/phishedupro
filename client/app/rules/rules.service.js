/**
 * Created by Dimitar on 5/11/2017.
 */
'use strict';
(function() {
  var RulesService = function($resource) {

    return $resource('/api/rules/:id', {
      id: '@id'
    },{
      update: {
        method:'PUT'
      }
    });
  };

  RulesService.$inject = ['$resource'];

  angular.module('phisheduproApp').factory('RulesService',
    RulesService);

}());
