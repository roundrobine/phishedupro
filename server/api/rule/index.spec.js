'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var ruleCtrlStub = {
  index: 'ruleCtrl.index',
  show: 'ruleCtrl.show',
  create: 'ruleCtrl.create',
  update: 'ruleCtrl.update',
  destroy: 'ruleCtrl.destroy'
};

var authServiceStub = {
  isAuthenticated() {
    return 'authService.isAuthenticated';
  },
  hasRole(role) {
    return 'authService.hasRole.' + role;
  }
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var ruleIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './rule.controller': ruleCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('Rule API Router:', function() {

  it('should return an express router instance', function() {
    expect(ruleIndex).to.equal(routerStub);
  });

  describe('GET /api/rules', function() {

    it('should be authenticated and should route to rule.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'authService.isAuthenticated', 'ruleCtrl.index')
        ).to.have.been.calledOnce;
    });

  });

  describe('GET /api/rules/:id', function() {

    it('should verify admin role and should route to rule.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'authService.hasRole.admin', 'ruleCtrl.show')
        ).to.have.been.calledOnce;
    });

  });

  describe('POST /api/rules', function() {

    it('should verify admin role and should route to rule.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'authService.hasRole.admin', 'ruleCtrl.create')
        ).to.have.been.calledOnce;
    });

  });

  describe('PUT /api/rules/:id', function() {

    it('should verify admin role and should route to rule.controller.update', function() {
      expect(routerStub.put
        .withArgs('/:id', 'authService.hasRole.admin', 'ruleCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('DELETE /api/rules/:id', function() {

    it('should verify admin role and should route to rule.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'authService.hasRole.admin', 'ruleCtrl.destroy')
        ).to.have.been.calledOnce;
    });

  });

});
