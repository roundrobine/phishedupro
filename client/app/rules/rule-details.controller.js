'use strict';
(function() {

  var RuleDetailsCtrl = function ($scope, $stateParams, socket, Auth, RulesService) {

    var vm = this;
    vm.isAuthenticated = Auth.isLoggedIn;
    vm.isAdmin = Auth.isAdmin;
    vm.rule = null;

    RulesService.get({id:$stateParams.id}, function(rule) {
      vm.rule = rule;
    });

  };

  RuleDetailsCtrl.$inject = ['$scope', '$stateParams', 'socket', 'Auth',  'RulesService'];

  angular.module('phisheduproApp')
    .controller('RuleDetailsCtrl', RuleDetailsCtrl);

}());
