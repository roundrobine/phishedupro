'use strict';
(function() {

  var RulesCtrl = function ($scope, $state, socket, Auth, RulesService) {

    var vm = this;
    vm.isAuthenticated = Auth.isLoggedIn;
    vm.isAdmin = Auth.isAdmin;
    vm.rules = null;

    vm.getRules = function () {
      RulesService.query(function (rules) {
        console.log(rules);
        vm.rules = rules;
      }, function(error) {
        console.log(error);
      });
    };

    vm.goRule = function(rule) {

      $state.go('ruledetails', {
        id: rule._id
      });
    };


    vm.getRules();

  };

  RulesCtrl.$inject = ['$scope', '$state', 'socket', 'Auth',  'RulesService'];

  angular.module('phisheduproApp')
    .controller('RulesCtrl', RulesCtrl);

}());
