'use strict';

var app = require('../..');
import request from 'supertest';

var newScan;

describe('Scan API:', function() {

  describe('GET /scan', function() {
    var scans;

    beforeEach(function(done) {
      request(app)
        .get('/scan')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          scans = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(scans).to.be.instanceOf(Array);
    });

  });

  describe('POST /scan', function() {
    beforeEach(function(done) {
      request(app)
        .post('/scan')
        .send({
          name: 'New Scan',
          info: 'This is the brand new scan!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newScan = res.body;
          done();
        });
    });

    it('should respond with the newly created scan', function() {
      expect(newScan.name).to.equal('New Scan');
      expect(newScan.info).to.equal('This is the brand new scan!!!');
    });

  });

  describe('GET /scan/:id', function() {
    var scan;

    beforeEach(function(done) {
      request(app)
        .get('/scan/' + newScan._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          scan = res.body;
          done();
        });
    });

    afterEach(function() {
      scan = {};
    });

    it('should respond with the requested scan', function() {
      expect(scan.name).to.equal('New Scan');
      expect(scan.info).to.equal('This is the brand new scan!!!');
    });

  });

  describe('PUT /scan/:id', function() {
    var updatedScan;

    beforeEach(function(done) {
      request(app)
        .put('/scan/' + newScan._id)
        .send({
          name: 'Updated Scan',
          info: 'This is the updated scan!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedScan = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedScan = {};
    });

    it('should respond with the updated scan', function() {
      expect(updatedScan.name).to.equal('Updated Scan');
      expect(updatedScan.info).to.equal('This is the updated scan!!!');
    });

  });

  describe('DELETE /scan/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/scan/' + newScan._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when scan does not exist', function(done) {
      request(app)
        .delete('/scan/' + newScan._id)
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
