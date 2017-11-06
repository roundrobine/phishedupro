'use strict';

describe('Controller: RulesCtrl', function () {

  // load the controller's module
  beforeEach(module('phisheduproApp'));

  var RulesCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RulesCtrl = $controller('RulesCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
