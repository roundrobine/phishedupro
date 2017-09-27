'use strict';

var app = require('../..');
import request from 'supertest';

var newRule;

describe('Rule API:', function() {

  describe('GET /api/rules', function() {
    var rules;

    beforeEach(function(done) {
      request(app)
        .get('/api/rules')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          rules = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(rules).to.be.instanceOf(Array);
    });

  });

  describe('POST /api/rules', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/rules')
        .send({
          name: 'New Rule',
          info: 'This is the brand new rule!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newRule = res.body;
          done();
        });
    });

    it('should respond with the newly created rule', function() {
      expect(newRule.name).to.equal('New Rule');
      expect(newRule.info).to.equal('This is the brand new rule!!!');
    });

  });

  describe('GET /api/rules/:id', function() {
    var rule;

    beforeEach(function(done) {
      request(app)
        .get('/api/rules/' + newRule._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          rule = res.body;
          done();
        });
    });

    afterEach(function() {
      rule = {};
    });

    it('should respond with the requested rule', function() {
      expect(rule.name).to.equal('New Rule');
      expect(rule.info).to.equal('This is the brand new rule!!!');
    });

  });

  describe('PUT /api/rules/:id', function() {
    var updatedRule;

    beforeEach(function(done) {
      request(app)
        .put('/api/rules/' + newRule._id)
        .send({
          name: 'Updated Rule',
          info: 'This is the updated rule!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedRule = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedRule = {};
    });

    it('should respond with the updated rule', function() {
      expect(updatedRule.name).to.equal('Updated Rule');
      expect(updatedRule.info).to.equal('This is the updated rule!!!');
    });

  });

  describe('DELETE /api/rules/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/rules/' + newRule._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when rule does not exist', function(done) {
      request(app)
        .delete('/api/rules/' + newRule._id)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});
