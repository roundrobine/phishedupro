'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var ruleCtrlStub = {
  index: 'ruleCtrl.index',
  show: 'ruleCtrl.show',
  create: 'ruleCtrl.create',
  update: 'ruleCtrl.update',
  destroy: 'ruleCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
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
  './rule.controller': ruleCtrlStub
});

describe('Rule API Router:', function() {

  it('should return an express router instance', function() {
    expect(ruleIndex).to.equal(routerStub);
  });

  describe('GET /api/rules', function() {

    it('should route to rule.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'ruleCtrl.index')
        ).to.have.been.calledOnce;
    });

  });

  describe('GET /api/rules/:id', function() {

    it('should route to rule.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'ruleCtrl.show')
        ).to.have.been.calledOnce;
    });

  });

  describe('POST /api/rules', function() {

    it('should route to rule.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'ruleCtrl.create')
        ).to.have.been.calledOnce;
    });

  });

  describe('PUT /api/rules/:id', function() {

    it('should route to rule.controller.update', function() {
      expect(routerStub.put
        .withArgs('/:id', 'ruleCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('PATCH /api/rules/:id', function() {

    it('should route to rule.controller.update', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'ruleCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('DELETE /api/rules/:id', function() {

    it('should route to rule.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'ruleCtrl.destroy')
        ).to.have.been.calledOnce;
    });

  });

});
