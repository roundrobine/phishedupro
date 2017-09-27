/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/rules              ->  index
 * POST    /api/rules              ->  create
 * GET     /api/rules/:id          ->  show
 * PUT     /api/rules/:id          ->  update
 * DELETE  /api/rules/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
var Rule = require('./rule.model');

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

function responseWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    return updated.saveAsync()
      .spread(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.removeAsync()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

// Gets a list of Rules
export function index(req, res) {
  Rule.findAsync()
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Gets a single Rule from the DB
export function show(req, res) {
  Rule.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Creates a new Rule in the DB
export function create(req, res) {
  Rule.createAsync(req.body)
    .then(responseWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Rule in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Rule.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Deletes a Rule from the DB
export function destroy(req, res) {
  Rule.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
