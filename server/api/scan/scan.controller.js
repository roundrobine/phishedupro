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
var json2csv = require('json2csv');
var fs = require('fs');
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
    console.log(err);
    res.status(statusCode).send(err);
  };
}

function responseWithResultOnScan(res, rules, statusCode) {
  statusCode = statusCode || 200;

  return function(entity) {
    if (entity) {
      let scanObject = entity.toObject();
      if (rules){
        scanObject.rules = rules;
      }
      res.status(statusCode).json(scanObject);
    }
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

function exportToCSV(res, statusCode) {
  statusCode = statusCode || 200;
  var fields = ['url','scanDate','isBlacklisted','finalScore', 'target', 'inputFields','domainRegistrationLength','ageOfDomain',
    'websiteTrafficAlexa','myWOT','externalLinks','domainAuthority','pageAuthority','mozRankURL','urlLenght','subdomains',
    'ssl','keywordDomainReport','isIPAddress','hasPrefixOrSufix','atSymbol','tinyURL','iframe','sfh','linksInTags',
    'requestUrls','urlOfAnchors'];
  return function(entity) {
    if (entity) {
      var csv = json2csv({ data: entity, fields: fields });
      fs.writeFile('website_scan_statisitics.csv', csv, function(err) {
        res.attachment('website_scan_statisitics.csv');
        res.status(200).send(csv);
      });
    }
  };
}

export function exportScanStatistics(req, res) {
  Scan.aggregate(
    {
      $match: {
        active: { $ne: false},
      }
    },
    {
      $project: {
        url: 1,
        scanDate: 1,
        finalScore:1,
        target:1,
        isBlacklisted:1,
        inputFields:"$statistics.inputFields.value",
        domainRegistrationLength:"$statistics.domainRegistrationLength.value",
        ageOfDomain:"$statistics.ageOfDomain.value",
        websiteTrafficAlexa:"$statistics.websiteTrafficAlexa.value",
        myWOT:"$statistics.myWOT.value",
        externalLinks:"$statistics.externalLinks.value",
        domainAuthority:"$statistics.domainAuthority.value",
        pageAuthority:"$statistics.pageAuthority.value",
        mozRankURL:"$statistics.mozRankURL.value",
        urlLenght:"$statistics.urlLenght.value",
        subdomains:"$statistics.subdomains.value",
        ssl:"$statistics.ssl.value",
        keywordDomainReport:"$statistics.keywordDomainReport.value",
        isIPAddress:"$statistics.isIPAddress.value",
        hasPrefixOrSufix:"$statistics.hasPrefixOrSufix.value",
        atSymbol:"$statistics.atSymbol.value",
        tinyURL:"$statistics.tinyURL.value",
        iframe:"$statistics.iframe.value",
        sfh:"$statistics.sfh.value",
        linksInTags:"$statistics.linksInTags.value",
        requestUrls:"$statistics.requestUrls.value",
        urlOfAnchors:"$statistics.urlOfAnchors.value",
      }
    },
    {$sort : { scanDate: -1}}
  )
    .execAsync()
    .then(exportToCSV(res))
    .catch(handleError(res));
}

// Gets a list of Scans
export function index(req, res) {

  //Create the query
  var query = {};
  if(req.query.search && req.query.search.length > 0){
    query = {'url':new RegExp(req.query.search, 'i') };
  }

  //Make sure limit and page are numbers and above 1
  if(!req.query.limit || parseFloat(req.query.limit) < 1){
    req.query.limit = 15;
  }
  if(!req.query.page || parseFloat(req.query.page) < 1){
    req.query.page = 1;
  }

  //Create the offset (ex. page = 1 and limit = 25 would result in 0 offset. page = 2 and limit = 25 would result in 25 offset.)
  var offset = (req.query.page - 1) * req.query.limit;

  //Testing if offset is bigger then result, if yes set offset to zero
  Scan.count(query, function(err, count) {
    if(offset > count){
      offset = 0;
    }

    //Create object for pagination query
    var options = {
      select: 'url urlScore totalRulesScore active target scanDate finalScore isBlacklisted responseTime statistics owner',
      sort: "-scanDate",
      populate: {path: 'owner', select: 'name email'},
      offset: offset,
      limit: parseFloat(req.query.limit)
    };

    //Do the actual pagination
    Scan.paginate(query, options)
      .then(responseWithResult(res))
      .catch(handleError(res));
  });


  /*Scan.findAsync()
    .then(responseWithResult(res))
    .catch(handleError(res));*/
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

  ScanService.checkURL(req.body, function(err, scan) {

    if(err){
      console.log(err);
      return res.status(500).send(err);
    }
    else {
      if(scan && scan.message){
        return res.status(200).json(scan);
      }
      else if(scan && scan.checkUrl.url_lookup_db){
        return res.status(200).json(scan.checkUrl.url_lookup_db);
      }

      ScanService.scanURLAndExtractFeatures(scan, function (err, result) {
        if (err) {
          console.log(err, result);
          return res.status(500).send(err);
        }
        else {
            ScanService.generatePhishingFeatureSet(result, function (err, rules) {
              let endTime = Date.now();
              let responseTime = (Math.round((endTime - startTime) * 100) / 100000 );
              result.responseTime = responseTime;
              console.log("Request time: ", responseTime);
              Scan.createAsync(result)
                .then(responseWithResultOnScan(res, rules,  201))
                .catch(handleError(res));
            });
          }
      });
    }

  });
}

export function stats(req, res){
  ScanService.generateStats(function(err, result){
    if(err){
      console.log(err, null);
      return res.status(500).send(err);
    }
    else{
      console.log(result);
      return res.status(200).json(result);
    }
    }
  )
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
