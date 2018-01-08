'use strict';

var app = require('../..');
import User from '../user/user.model';
import Rule  from './rule.model';
import request from 'supertest';

var newRule;

describe('Rule API:', function() {
  var user;
  var token;

  // Clear users before testing
  before(function() {
    return User.removeAsync().then(function() {
      user = new User({
        provider: 'local',
        role: 'admin',
        name: 'Admin',
        email: 'adminUser@example.com',
        password: 'Tphalo8c'
      });

      return user.saveAsync();
    });
  });

  before(function(done) {
    request(app)
      .post('/auth/local')
      .send({
        email: 'adminUser@example.com',
        password: 'Tphalo8c'
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });

  // Clear users after testing
  after(function() {
    return User.removeAsync();
  });

  after(function() {
    return Rule.removeAsync();
  });

  describe('GET /api/rules', function() {
    var rules;

    beforeEach(function(done) {
      request(app)
        .get('/api/rules')
        .set('authorization', 'Bearer ' + token)
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

    it('should respond with a 401 when not authenticated', function(done) {
      request(app)
        .get('/api/rules')
        .expect(401)
        .end(done);
    });


  });

  describe('POST /api/rules', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/rules')
        .set('authorization', 'Bearer ' + token)
        .send({
          name: 'URL’s having at Symbol',
          code: 'atSymbol',
          weight: 0.002,
          description: 'Symbol description for the rule that at symbol should be present in the URL',
          active: true
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
      expect(newRule.name).to.equal('URL’s having at Symbol');
      expect(newRule.code).to.equal('atSymbol');
      expect(newRule.weight).to.equal(0.002);
      expect(newRule.description).to.equal('Symbol description for the rule that at symbol should be present in the URL');
      expect(newRule.active).to.equal(true);
    });



  });

  describe('GET /api/rules/:id', function() {
    var rule;

    beforeEach(function(done) {
      request(app)
        .get('/api/rules/' + newRule._id)
        .set('authorization', 'Bearer ' + token)
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
      expect(rule.name).to.equal('URL’s having at Symbol');
      expect(rule.code).to.equal('atSymbol');
      expect(rule.weight).to.equal(0.002);
      expect(rule.description).to.equal('Symbol description for the rule that at symbol should be present in the URL');
      expect(rule.active).to.equal(true);
    });

  });

  describe('PUT /api/rules/:id', function() {
    var updatedRule;

    beforeEach(function(done) {
      request(app)
        .put('/api/rules/' + newRule._id)
        .set('authorization', 'Bearer ' + token)
        .send({
          name: 'Domain Registration Length',
          code: 'domainRegistrationLength',
          weight: 0.036,
          description: 'Based on the fact that a phishing website lives for a short period of time, we believe ' +
          'that trustworthy domains are regularly paid for several years in advance. In our dataset, ' +
          'we find that the longest fraudulent domains have been used for one year only.',
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
      expect(updatedRule.name).to.equal('Domain Registration Length');
      expect(updatedRule.code).to.equal('domainRegistrationLength');
      expect(updatedRule.weight).to.equal(0.036);
      expect(updatedRule.description).to.equal('Based on the fact that a phishing website lives for a short period of time, we believe ' +
        'that trustworthy domains are regularly paid for several years in advance. In our dataset, ' +
        'we find that the longest fraudulent domains have been used for one year only.');
      expect(updatedRule.active).to.equal(true);
    });

  });

  describe('DELETE /api/rules/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/rules/' + newRule._id)
        .set('authorization', 'Bearer ' + token)
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
        .set('authorization', 'Bearer ' + token)
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
