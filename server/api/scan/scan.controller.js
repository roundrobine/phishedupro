/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /scan              ->  index
 * POST    /scan              ->  create
 * GET     /scan/:id          ->  show
 * PUT     /scan/:id          ->  update
 * DELETE  /scan/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
var Scan = require('./scan.model');
var ScanService = require('./scan.service');
var url = require('url');
var parseDomain = require("parse-domain");
var ipaddr = require('ipaddr.js');
const DOT_CHARACTER = '\\.';
const WWW = "www"


//count('Yes. I want. to. place a. lot of. dots.','\\.'); //=> 6
function count(url, character) {
  return ( url.match( RegExp(character,'g') ) || [] ).length;
}

function removeWWWSubdomainFromURL(url){
  if(url && url.length > 2 && url.substring(0,3).toLowerCase() === WWW)
    return url.substring(3);
  return url;
}

// This regex let's you test if your url consists of ipv4 urls
var ipv4UrlValidation = RegExp([
  '^https?:\/\/([a-z0-9\\.\\-_%]+:([a-z0-9\\.\\-_%])+?@)?',
  '((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\\.){3}(25[0-5]|2[0-4',
  '][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])?',
  '(:[0-9]+)?(\/[^\\s]*)?$'
].join(''), 'i');


function isUrlIPAddress(url){
  return ipv4UrlValidation.test(url);
}


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

// Gets a list of Scans
export function index(req, res) {
  Scan.findAsync()
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Gets a single Scan from the DB
export function show(req, res) {
  Scan.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Creates a new Scan in the DB
export function create(req, res) {
  let startTime = Date.now();
    ScanService.scanURLAndExtractFeatures(req.body, function(err, result) {
      if(err) {
        console.log(err, result);
        return res.status(500).send(err);
      }
      else {
        if(result && result.message === "The website is not currently online!"){

            return res.status(200).json(result);
        }
        else {
          ScanService.generatePhishingFeatureSet(result, function (err, rules) {
            let endTime = Date.now();
            let responseTime = (Math.round((endTime - startTime) * 100) / 100000 );
            result.responseTime = responseTime;
            console.log("Request time: ", responseTime);
            Scan.createAsync(result)
              .then(responseWithResult(res, 201))
              .catch(handleError(res));
          });
        }
      }

    });

}

// Updates an existing Scan in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Scan.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Deletes a Scan from the DB
export function destroy(req, res) {
  Scan.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
