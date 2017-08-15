'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var scanCtrlStub = {
  index: 'scanCtrl.index',
  show: 'scanCtrl.show',
  create: 'scanCtrl.create',
  update: 'scanCtrl.update',
  destroy: 'scanCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
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
  './scan.controller': scanCtrlStub
});

describe('Scan API Router:', function() {

  it('should return an express router instance', function() {
    expect(scanIndex).to.equal(routerStub);
  });

  describe('GET /scan', function() {

    it('should route to scan.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'scanCtrl.index')
        ).to.have.been.calledOnce;
    });

  });

  describe('GET /scan/:id', function() {

    it('should route to scan.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'scanCtrl.show')
        ).to.have.been.calledOnce;
    });

  });

  describe('POST /scan', function() {

    it('should route to scan.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'scanCtrl.create')
        ).to.have.been.calledOnce;
    });

  });

  describe('PUT /scan/:id', function() {

    it('should route to scan.controller.update', function() {
      expect(routerStub.put
        .withArgs('/:id', 'scanCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('PATCH /scan/:id', function() {

    it('should route to scan.controller.update', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'scanCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('DELETE /scan/:id', function() {

    it('should route to scan.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'scanCtrl.destroy')
        ).to.have.been.calledOnce;
    });

  });

});
