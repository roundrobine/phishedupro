'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var scanCtrlStub = {
  index: 'scanCtrl.index',
  exportScanStatistics: 'scanCtrl.exportScanStatistics',
  stats: 'scanCtrl.stats',
  show: 'scanCtrl.show',
  create: 'scanCtrl.create',
  update: 'scanCtrl.update',
  destroy: 'scanCtrl.destroy'
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
var scanIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './scan.controller': scanCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('Scan API Router:', function() {

  it('should return an express router instance', function() {
    expect(scanIndex).to.equal(routerStub);
  });

  describe('GET /scan', function() {

    it('should be authenticated and should route to scan.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'authService.isAuthenticated', 'scanCtrl.index')
        ).to.have.been.calledOnce;
    });

  });

  describe('GET /scan/:id', function() {

    it('should be authenticated and should route to scan.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'authService.isAuthenticated', 'scanCtrl.show')
        ).to.have.been.calledOnce;
    });

  });

  describe('GET /scan/export', function() {

    it('should route to scan.controller.exportScanStatistics', function() {
      expect(routerStub.get
        .withArgs('/export', 'scanCtrl.exportScanStatistics')
      ).to.have.been.calledOnce;
    });

  });

  describe('GET /scan/stats', function() {

    it('should be authenticated and should route to scan.controller.stats', function() {
      expect(routerStub.get
        .withArgs('/stats','authService.isAuthenticated', 'scanCtrl.stats')
      ).to.have.been.calledOnce;
    });

  });

  describe('POST /scan', function() {

    it('should be authenticated and should route to scan.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'authService.isAuthenticated','scanCtrl.create')
        ).to.have.been.calledOnce;
    });

  });

  describe('PUT /scan/:id', function() {

    it('should verify admin role and should route to scan.controller.update', function() {
      expect(routerStub.put
        .withArgs('/:id', 'authService.hasRole.admin', 'scanCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('DELETE /scan/:id', function() {

    it('should verify admin role and should route to scan.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'authService.hasRole.admin', 'scanCtrl.destroy')
        ).to.have.been.calledOnce;
    });

  });

});
