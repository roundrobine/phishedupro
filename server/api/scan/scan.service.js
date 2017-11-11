'use strict';
import config from '../../config/environment';
import Rule from '../rule/rule.model';
import Scan from '../scan/scan.model';
import _ from 'lodash';
const MY_WOT = require('./scan.config').MY_WOT;
const MOZCAPE = require('./scan.config').MOZCAPE;
const TOP_PHISHING_DOMAINS = require('./scan.config').TOP_PHISHING_DOMAINS;
const TOP_PHISHING_SUB_DOMAINS = require('./scan.config').TOP_PHISHING_SUB_DOMAINS;
const TOP_PHISHING_IP_ADDRESSES = require('./scan.config').TOP_PHISHING_IP_ADDRESSES;
const TOP_PHISHING_KEYWORDS = require('./scan.config').TOP_PHISHING_KEYWORDS;
const WHITELISTED_DOMAINS = require('./scan.config').WHITELISTED_DOMAINS;
const PHISHING_CLASS = require('./scan.config').PHISHING_CLASS;
const RULE_CODES = require('./scan.config').RULE_CODES;
const SCAN_ERROR_MESSAGES = require('./scan.config').SCAN_ERROR_MESSAGES;

const async = require('async');
const parseDomain = require("parse-domain");
const dns = require('dns');
const tall = require('tall').default;
const urlParser = require('url');
const ipaddr = require('ipaddr.js');
const alexa = require('alexarank');
const rp = require('request-promise');
const crypto = require('crypto');
const validUrl = require('valid-url');
var moment = require('moment');
var http = require('http');
const DOT_CHARACTER = '\\.';
const WWW = "www";
const HTTPS = 'https:';
const JAVA_SCRIPT_VOID_0 = "javascript:void(0)";
const ABOUT_BLANK = "about:blank";
const HASH = "#";
const CONTENT_HASH = "#content";
const SKIP_HASH = "#skip";
const INPUT_TYPE_TEXT = "text";
const INPUT_TYPE_PASSWORD = "password";
const INPUT_TYPE_EMAIL = "email";
const INPUT_TYPE_TEL = "tel";
const UNKNOWN = -2;
const WHOIS_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss Z";
const GOOGLE_ANALYTICS = "google-analytics.com";
const GOOGLE_APIS = "googleapis.com";
const GOOGLE = "google";
const GOOGLE_SYNDICATION = "googlesyndication.com";
const GRAVATAR = "gravatar.com";
const LINKS_IN_TAGS = "linksInTags";
const REQUEST_URLS = "requestUrl";
const ANGULAR_JS_PATH_REGEX = new RegExp("^#!?\\/.*");
const IDENTICAL_URL_MAX_COUNT = 5;
const HASH_ANCHOR_URL_MAX_COUNT = 15;

var Nightmare = require('nightmare');

//count('Yes. I want. to. place a. lot of. dots.','\\.'); //=> 6
function count(url, character) {
  return ( url.match( RegExp(character,'g') ) || [] ).length;
}


function removeWWWSubdomainFromURL(url){
  if(url && url.length > 2 && url.substring(0,3).toLowerCase() === WWW)
    return url.substring(4);
  return url;
}

/*function generate_signature(expires) {
  var hash = crypto.createHmac('sha1', config.secrets.moz.secretKey);
  hash.setEncoding('base64');
  hash.write(config.secrets.moz.accessId + '\n' + expires);
  hash.end();

  return hash.read();
}*/

function switchMyWOTCategories(category){
  let categoryDescription = '';
  switch(category) {
    case MY_WOT.CATEGORY.C_101.VALUE:
      categoryDescription = MY_WOT.CATEGORY.C_101.DESCRIPTION;
      break;
    case MY_WOT.CATEGORY.C_102.VALUE:
      categoryDescription = MY_WOT.CATEGORY.C_102.DESCRIPTION;
      break;
    case MY_WOT.CATEGORY.C_103.VALUE:
      categoryDescription = MY_WOT.CATEGORY.C_103.DESCRIPTION;
      break;
    case MY_WOT.CATEGORY.C_104.VALUE:
      categoryDescription = MY_WOT.CATEGORY.C_104.DESCRIPTION;
      break;
    case MY_WOT.CATEGORY.C_105.VALUE:
      categoryDescription = MY_WOT.CATEGORY.C_105.DESCRIPTION;
      break;
    case MY_WOT.CATEGORY.C_201.VALUE:
      categoryDescription = MY_WOT.CATEGORY.C_201.DESCRIPTION;
      break;
    case MY_WOT.CATEGORY.C_202.VALUE:
      categoryDescription = MY_WOT.CATEGORY.C_202.DESCRIPTION;
      break;
    case MY_WOT.CATEGORY.C_203.VALUE:
      categoryDescription = MY_WOT.CATEGORY.C_203.DESCRIPTION;
      break;
    case MY_WOT.CATEGORY.C_204.VALUE:
      categoryDescription = MY_WOT.CATEGORY.C_204.DESCRIPTION;
      break;
    case MY_WOT.CATEGORY.C_205.VALUE:
      categoryDescription = MY_WOT.CATEGORY.C_205.DESCRIPTION;
      break;
    case MY_WOT.CATEGORY.C_206.VALUE:
      categoryDescription = MY_WOT.CATEGORY.C_206.DESCRIPTION;
      break;
    case MY_WOT.CATEGORY.C_207.VALUE:
      categoryDescription = MY_WOT.CATEGORY.C_207.DESCRIPTION;
      break;
    case MY_WOT.CATEGORY.C_301.VALUE:
      categoryDescription = MY_WOT.CATEGORY.C_301.DESCRIPTION;
      break;
    case MY_WOT.CATEGORY.C_302.VALUE:
      categoryDescription = MY_WOT.CATEGORY.C_302.DESCRIPTION;
      break;
    case MY_WOT.CATEGORY.C_303.VALUE:
      categoryDescription = MY_WOT.CATEGORY.C_303.DESCRIPTION;
      break;
    case MY_WOT.CATEGORY.C_304.VALUE:
      categoryDescription = MY_WOT.CATEGORY.C_304.DESCRIPTION;
      break;
    case MY_WOT.CATEGORY.C_401.VALUE:
      categoryDescription = MY_WOT.CATEGORY.C_401.DESCRIPTION;
      break;
    case MY_WOT.CATEGORY.C_402.VALUE:
      categoryDescription = MY_WOT.CATEGORY.C_402.DESCRIPTION;
      break;
    case MY_WOT.CATEGORY.C_403.VALUE:
      categoryDescription = MY_WOT.CATEGORY.C_403.DESCRIPTION;
      break;
    case MY_WOT.CATEGORY.C_404.VALUE:
      categoryDescription = MY_WOT.CATEGORY.C_404.DESCRIPTION;
      break;
    case MY_WOT.CATEGORY.C_501.VALUE:
      categoryDescription = MY_WOT.CATEGORY.C_501.DESCRIPTION;
      break;
    default:
      categoryDescription = "Unknown category!";
  }

  return categoryDescription;

}


function switchWOTBlacklists(blacklist) {
  let blacklistDescription = '';
  switch (blacklist) {
    case MY_WOT.BLACKLIST_TYPE.MALWARE.NAME:
      blacklistDescription = MY_WOT.BLACKLIST_TYPE.MALWARE.DESCRIPTION;
      break;
    case MY_WOT.BLACKLIST_TYPE.PHISHING.NAME:
      blacklistDescription = MY_WOT.BLACKLIST_TYPE.PHISHING.DESCRIPTION;
      break;
    case MY_WOT.BLACKLIST_TYPE.SCAM.NAME:
      blacklistDescription = MY_WOT.BLACKLIST_TYPE.SCAM.DESCRIPTION;
      break;
    case MY_WOT.BLACKLIST_TYPE.SPAM.NAME:
      blacklistDescription = MY_WOT.BLACKLIST_TYPE.SPAM.DESCRIPTION;
      break;
    default:
      blacklistDescription = "Unknown blacklist!";
  }

   return blacklistDescription;
}

function calculatePercentage(total, amount){
  return Math.round((amount / total) * 100);
}



function checkUrlExists(url, cb) {
  var options = {
    method: 'HEAD',
    host: urlParser.parse(url).host,
    port: 80,
    path: urlParser.parse(url).pathname
  };
  let online = {isOnline:true};
  var req = http.request(options, function (res) {
   /* if (('' + res.statusCode).match(/^5\d\d$/)){
    // Server error, I have no idea what happend in the backend
    // but server at least returned correctly (in a HTTP protocol
    // sense) formatted response
      //console.log("Not online: ", res);
      online.isOnline = false;
      cb(online, null);
    }
    else{*/
      cb(null, online);
    /*}*/

  });
  req.on('error', function (e) {
    // General error, i.e.
    //  - ECONNRESET - server closed the socket unexpectedly
    //  - ECONNREFUSED - server did not listen
    //  - HPE_INVALID_VERSION
    //  - HPE_INVALID_STATUS
    //  - ... (other HPE_* codes) - server returned garbage
    console.log("Not online: ", e);
    online.isOnline = false;
    cb(online, null);
  });

  req.on('timeout', function () {
    // Timeout happend. Server received request, but not handled it
    // (i.e. doesn't send any response or it took to long).
    // You don't know what happend.
    // It will emit 'error' message as well (with ECONNRESET code).

    console.log('timeout');
    req.abort();
  });

  req.setTimeout(7000);
  req.end();
}


export function generatePhishingFeatureSet(scanResults, cb){
  Rule.findAsync()
    .then(function(rules){
      let scanStatistics = scanResults.statistics;
      let urlScore = 0;
      let totalRulesScore = 0;
      for(var i = 0; i <rules.length; i++){
        totalRulesScore = totalRulesScore + rules[i].weight;
          switch (rules[i].code){
            case RULE_CODES.ageOfDomain:
            case RULE_CODES.domainRegistrationLength:
              if(scanStatistics[rules[i].code]){
                if(scanStatistics[rules[i].code].days >=  rules[i].phishing){
                  scanStatistics[rules[i].code].value = PHISHING_CLASS.legitimate;
                }
                else{
                  scanStatistics[rules[i].code].value = PHISHING_CLASS.phishing;
                  urlScore = urlScore + rules[i].weight;
                }
              }
              break;
            case RULE_CODES.hasPrefixOrSufix:
            case RULE_CODES.iframe:
            case RULE_CODES.keywordDomainReport:
            case RULE_CODES.tinyURL:
            case RULE_CODES.atSymbol:
            case RULE_CODES.isIPAddress:
              if(scanStatistics[rules[i].code]){
                if(scanStatistics[rules[i].code].value ===  PHISHING_CLASS.phishing){
                  urlScore = urlScore + rules[i].weight;
                }
              }
              break;
            case RULE_CODES.sfh:
              if(scanStatistics[rules[i].code]){
                if(scanStatistics[rules[i].code].value ===  PHISHING_CLASS.phishing){
                  urlScore = urlScore + rules[i].weight;
                }
                else if(scanStatistics[rules[i].code].value ===  PHISHING_CLASS.suspicious){
                  urlScore = urlScore + (rules[i].weight / 2);
                }
              }
              break;
            case RULE_CODES.domainAuthority:
            case RULE_CODES.pageAuthority:
            case RULE_CODES.myWOT:
              if(scanStatistics[rules[i].code]){
                if(rules[i].code === RULE_CODES.myWOT && scanResults.alexa.isRanked
                  && !scanResults.isBlacklisted && !scanResults.myWOT.hasWOTStatistics){
                  scanStatistics[rules[i].code].value = PHISHING_CLASS.suspicious;
                  urlScore = urlScore + (rules[i].weight / 2);
                }
                else if(rules[i].code === RULE_CODES.myWOT && scanResults.myWOT.isBlacklisted){
                  scanStatistics[rules[i].code].value = PHISHING_CLASS.phishing;
                  urlScore = urlScore + rules[i].weight;
                }
                else if(scanStatistics[rules[i].code].count < rules[i].phishing){
                  scanStatistics[rules[i].code].value = PHISHING_CLASS.phishing;
                  urlScore = urlScore + rules[i].weight;
                }
                else if (scanStatistics[rules[i].code].count >= rules[i].phishing && scanStatistics[rules[i].code].count < rules[i].suspicious){
                  scanStatistics[rules[i].code].value = PHISHING_CLASS.suspicious;
                  urlScore = urlScore + (rules[i].weight / 2);
                }
                else if(scanResults.urlStatisitcs.topPhishingDomain || scanResults.urlStatisitcs.topPhishingSubDomain
                || scanResults.urlStatisitcs.topPhishingIP){
                  scanStatistics[rules[i].code].value = PHISHING_CLASS.suspicious;
                  urlScore = urlScore + (rules[i].weight / 2);
                }
                else{
                  scanStatistics[rules[i].code].value = PHISHING_CLASS.legitimate;
                }
              }
              break;
            case RULE_CODES.ssl:
              if(scanStatistics.ssl){
                if(scanStatistics.ssl.value === PHISHING_CLASS.phishing){
                  urlScore = urlScore + rules[i].weight;
                }
                else if(scanStatistics.ssl.isTrusted && scanStatistics.ssl.duration > 0
                  && scanStatistics.ssl.expiresIn > -1 && scanStatistics.ssl.completeCertChain && scanResults.urlStatisitcs.whitelistedDomain){

                    scanStatistics.ssl.value = PHISHING_CLASS.legitimate;
                }
                else if (scanStatistics.ssl.isTrusted && scanStatistics.ssl.duration >= rules[i].phishing && scanStatistics.ssl.expiresIn > -1
                && scanStatistics.ssl.completeCertChain && !scanResults.urlStatisitcs.topPhishingDomain && !scanResults.urlStatisitcs.topPhishingSubDomain
                && !scanResults.urlStatisitcs.topPhishingIP){
                  scanStatistics.ssl.value = PHISHING_CLASS.legitimate;
                }
                else if(scanStatistics.ssl.isTrusted && scanStatistics.ssl.duration >= rules[i].phishing && scanStatistics.ssl.expiresIn > -1
                  && scanStatistics.ssl.completeCertChain && scanResults.urlStatisitcs.topPhishingSubDomain){
                  scanStatistics.ssl.value = PHISHING_CLASS.phishing;
                  urlScore = urlScore + (rules[i].weight);
                }
                else if(!scanStatistics.ssl.isTrusted && scanStatistics.ssl.duration >= rules[i].phishing && scanStatistics.ssl.expiresIn > -1){
                  scanStatistics.ssl.value = PHISHING_CLASS.suspicious;
                  urlScore = urlScore + (rules[i].weight /2);
                }
                else if(scanStatistics.ssl.isTrusted && scanStatistics.ssl.duration >= rules[i].phishing && scanStatistics.ssl.expiresIn > -1
                  && scanStatistics.ssl.completeCertChain && scanResults.urlStatisitcs.topPhishingDomain){
                  scanStatistics.ssl.value = PHISHING_CLASS.suspicious;
                  urlScore = urlScore + (rules[i].weight /2);
                }
                else if(scanStatistics.ssl.isTrusted && scanStatistics.ssl.duration >= rules[i].phishing && scanStatistics.ssl.expiresIn > -1
                  && scanStatistics.ssl.completeCertChain && scanResults.urlStatisitcs.topPhishingIP){
                  scanStatistics.ssl.value = PHISHING_CLASS.suspicious;
                  urlScore = urlScore + (rules[i].weight /2);
                }
                else{
                  scanStatistics.ssl.value = PHISHING_CLASS.phishing;
                  urlScore = urlScore + (rules[i].weight);
                }
              }
              break;
            case RULE_CODES.requestUrls:
            case RULE_CODES.linksInTags:
            case RULE_CODES.urlOfAnchors:
              if(scanStatistics[rules[i].code]){
                if(scanStatistics[rules[i].code].percentage < rules[i].suspicious){
                  scanStatistics[rules[i].code].value = PHISHING_CLASS.legitimate;
                }
                else if (scanStatistics[rules[i].code].percentage >= rules[i].suspicious && scanStatistics[rules[i].code].percentage <= rules[i].phishing){
                  scanStatistics[rules[i].code].value = PHISHING_CLASS.suspicious;
                  urlScore = urlScore + (rules[i].weight / 2);
                }
                else{
                  scanStatistics[rules[i].code].value = PHISHING_CLASS.phishing;
                  urlScore = urlScore + rules[i].weight;
                }
              }
              break;
            case RULE_CODES.urlLenght:
              if(scanStatistics.urlLenght){
                if(scanStatistics.urlLenght.count < rules[i].suspicious){
                  scanStatistics.urlLenght.value = PHISHING_CLASS.legitimate;
                }
                else if (scanStatistics.urlLenght.count >= rules[i].suspicious && scanStatistics.urlLenght.count <= rules[i].phishing){
                  scanStatistics.urlLenght.value = PHISHING_CLASS.suspicious;
                  urlScore = urlScore + (rules[i].weight / 2);
                }
                else{
                  scanStatistics.urlLenght.value = PHISHING_CLASS.phishing;
                  urlScore = urlScore + rules[i].weight;
                }
              }
              break;
            case RULE_CODES.subdomains:
              if(scanStatistics.subdomains){
                if(scanStatistics.subdomains.count < rules[i].suspicious){
                  scanStatistics.subdomains.value = PHISHING_CLASS.legitimate;
                }
                else if (scanStatistics.subdomains.count === rules[i].suspicious){
                  scanStatistics.subdomains.value = PHISHING_CLASS.suspicious;
                  urlScore = urlScore + (rules[i].weight / 2);
                }
                else{
                  scanStatistics.subdomains.value = PHISHING_CLASS.phishing;
                  urlScore = urlScore + rules[i].weight;
                }
              }
              break;
            case RULE_CODES.externalLinks:
              if(scanStatistics.externalLinks){
                if(scanStatistics.externalLinks.count === rules[i].phishing){
                  scanStatistics.externalLinks.value = PHISHING_CLASS.phishing;
                  urlScore = urlScore + rules[i].weight;
                }
                else if (scanStatistics.externalLinks.count > rules[i].phishing && scanStatistics.externalLinks.count <= rules[i].suspicious){
                  scanStatistics.externalLinks.value = PHISHING_CLASS.suspicious;
                  urlScore = urlScore + (rules[i].weight / 2);
                }
                else{
                  scanStatistics.externalLinks.value = PHISHING_CLASS.legitimate;
                }
              }
              break;
            case RULE_CODES.websiteTrafficAlexa:
              if(scanStatistics.websiteTrafficAlexa){
                if(scanStatistics.websiteTrafficAlexa.rank === rules[i].phishing){
                  scanStatistics.websiteTrafficAlexa.value = PHISHING_CLASS.phishing;
                  urlScore = urlScore + rules[i].weight;
                }
                else if (scanStatistics.websiteTrafficAlexa.rank > rules[i].suspicious ||
                  (scanStatistics.websiteTrafficAlexa.rank > rules[i].phishing && scanStatistics.websiteTrafficAlexa.rank <= rules[i].suspicious
                    && (scanResults.urlStatisitcs.topPhishingDomain || scanResults.urlStatisitcs.topPhishingSubDomain) )){
                  scanStatistics.websiteTrafficAlexa.value = PHISHING_CLASS.suspicious;
                  urlScore = urlScore + (rules[i].weight / 2);
                }
                else{
                  scanStatistics.websiteTrafficAlexa.value = PHISHING_CLASS.legitimate;
                }
              }
              break;
            case RULE_CODES.mozRankURL:
              if(scanStatistics[rules[i].code]){
                if(scanStatistics[rules[i].code].count <  rules[i].phishing){
                  scanStatistics[rules[i].code].value = PHISHING_CLASS.phishing;
                  urlScore = urlScore + rules[i].weight;
                }
                else{
                  scanStatistics[rules[i].code].value = PHISHING_CLASS.legitimate;
                }
              }
              break;
            case RULE_CODES.inputFields:
              if(scanStatistics.ssl && scanStatistics.inputFields){
                if(scanStatistics.ssl.value === PHISHING_CLASS.phishing){

                  if(scanStatistics.inputFields.numOfPasswordFields > 0){
                    scanStatistics.inputFields.value = PHISHING_CLASS.phishing;
                    urlScore = urlScore + rules[i].weight;
                  }
                  else if(scanStatistics.inputFields.numOfTextFields > 0 && scanStatistics.inputFields.numOfPasswordFields === 0){
                    scanStatistics.inputFields.value = PHISHING_CLASS.suspicious;
                    urlScore = urlScore + (rules[i].weight/2);
                  }
                  else{
                    scanStatistics.inputFields.value = PHISHING_CLASS.legitimate;
                  }
                }
                else if (scanStatistics.ssl.value === PHISHING_CLASS.legitimate){
                  scanStatistics.inputFields.value = PHISHING_CLASS.legitimate;
                }
                else if(scanStatistics.ssl.value === PHISHING_CLASS.suspicious
                  && (scanStatistics.inputFields.numOfTextFields > 0 || scanStatistics.inputFields.numOfPasswordFields > 0)){
                    scanStatistics.inputFields.value = PHISHING_CLASS.suspicious;
                    urlScore = urlScore + (rules[i].weight /2);
                }
                else{
                  if(scanStatistics.inputFields.numOfTextFields > 0 && scanStatistics.inputFields.numOfPasswordFields === 0){
                    scanStatistics.inputFields.value = PHISHING_CLASS.suspicious;
                    urlScore = urlScore + (rules[i].weight/2);
                  }
                  else if(scanStatistics.inputFields.numOfPasswordFields > 0){
                    scanStatistics.inputFields.value = PHISHING_CLASS.phishing;
                    urlScore = urlScore + rules[i].weight;
                  }
                  else{
                    scanStatistics.inputFields.value = PHISHING_CLASS.legitimate;
                  }
                }
              }
              break;

          }
      }
      scanResults.urlScore = Math.round(urlScore * 1000) / 1000;
      scanResults.totalRulesScore = Math.round(totalRulesScore * 1000) / 1000;
      scanResults.finalScore = calculatePercentage(totalRulesScore, urlScore);

      if(scanResults.isBlacklisted){
        scanResults.finalScore = 100;
      }

      cb(null,rules);
    },function(err){
      cb(err, null);
    })
}


function urlOfAnchorStatistics(anchorArray, parsedUrl, linkType){
  let urlOfAnchor = {
    totalNumOfLinks:0,
    validNumOfLinks:0,
    invalidNumOfLinks:0,
    percentage : 0,
    validLinksArray: [],
    invalidLinksArray: []
  };
  let invalidLinks = 0;
  let validLinks = 0;
  let nextUrl = null;

  let baseHostNoSubdomain = null;
  let newHostNoSubdomain = null;
  let onlyBaseDomainHost = null;
  let onlyNewDomainHost = null;
  /*let identicalUrlCount = 0;
  let hashAnchorsUrlCount = 0;*/
  let anchorArrayLength = anchorArray.length;

  if(!parsedUrl.isUrlIPAddress) {
    baseHostNoSubdomain = parsedUrl.tokenizeHost.domain + "." + parsedUrl.tokenizeHost.tld;
    onlyBaseDomainHost = parsedUrl.tokenizeHost.domain;
  }

  anchorArray.forEach(function(url){
    newHostNoSubdomain = null;
    if (typeof url === 'string' || url instanceof String) {
      nextUrl = urlParser.parse(url);
    }

    if(nextUrl && nextUrl.hostname) {
      nextUrl.isUrlIPAddress = ipaddr.isValid(nextUrl.hostname);
    }

    if(nextUrl && nextUrl.href && (validUrl.isHttpUri(nextUrl.href) || validUrl.isHttpsUri(nextUrl.href))) {
      if (!nextUrl.isUrlIPAddress && nextUrl.hostname) {
        nextUrl.tokenizeHost = parseDomain(nextUrl.hostname);
        if(nextUrl.tokenizeHost) {
          newHostNoSubdomain = nextUrl.tokenizeHost.domain + "." + nextUrl.tokenizeHost.tld;
          onlyNewDomainHost = nextUrl.tokenizeHost.domain;
        }
      }

      if (nextUrl.hostname && parsedUrl.hostname && nextUrl.hostname === parsedUrl.hostname) {

        if (nextUrl.path === parsedUrl.path && !nextUrl.hash) {
          /*identicalUrlCount = identicalUrlCount + 1;*/
          if(anchorArrayLength > IDENTICAL_URL_MAX_COUNT){
            validLinks = validLinks + 1;
            urlOfAnchor.validLinksArray.push(nextUrl.href);
          } else{
            invalidLinks = invalidLinks + 1;
            urlOfAnchor.invalidLinksArray.push(nextUrl.href);
          }

        }
        else if(nextUrl.path === parsedUrl.path && nextUrl.hash){
          /*if(ANGULAR_JS_PATH_REGEX.test(nextUrl.hash)){
            validLinks = validLinks + 1;
            urlOfAnchor.validLinksArray.push(nextUrl.href);
          }
          else */if(!(nextUrl.hash === HASH) && !(nextUrl.hash === CONTENT_HASH) && !(nextUrl.hash === SKIP_HASH)){
            //hashAnchorsUrlCount = hashAnchorsUrlCount + 1;
            if(anchorArrayLength > HASH_ANCHOR_URL_MAX_COUNT) {
              validLinks = validLinks + 1;
              urlOfAnchor.validLinksArray.push(nextUrl.href);
            }else{
              invalidLinks = invalidLinks + 1;
              urlOfAnchor.invalidLinksArray.push(nextUrl.href);
            }
          }
          else {
            invalidLinks = invalidLinks + 1;
            urlOfAnchor.invalidLinksArray.push(nextUrl.href);
          }
        }
        else {
          validLinks = validLinks + 1;
          urlOfAnchor.validLinksArray.push(nextUrl.href);
        }
      }
      else if (newHostNoSubdomain && baseHostNoSubdomain && newHostNoSubdomain === baseHostNoSubdomain) {
        validLinks = validLinks + 1;
        urlOfAnchor.validLinksArray.push(nextUrl.href);
      }
      else if(onlyNewDomainHost && onlyBaseDomainHost && onlyNewDomainHost === onlyBaseDomainHost){
        validLinks = validLinks + 1;
        urlOfAnchor.validLinksArray.push(nextUrl.href);
      }
      else if(linkType && newHostNoSubdomain && onlyNewDomainHost &&
        (newHostNoSubdomain === GOOGLE_ANALYTICS || newHostNoSubdomain === GOOGLE_APIS || newHostNoSubdomain === GOOGLE_SYNDICATION
          || onlyNewDomainHost === GOOGLE || newHostNoSubdomain === GRAVATAR) ){
        validLinks = validLinks + 1;
        urlOfAnchor.validLinksArray.push(nextUrl.href);
      }
      else {
        invalidLinks = invalidLinks + 1;
        urlOfAnchor.invalidLinksArray.push(nextUrl.href);
      }
    }
    else{
      invalidLinks = invalidLinks + 1;
      urlOfAnchor.invalidLinksArray.push(nextUrl.href);
    }

  });

  urlOfAnchor.validNumOfLinks = validLinks;
  urlOfAnchor.invalidNumOfLinks = invalidLinks;
  urlOfAnchor.totalNumOfLinks = anchorArray.length;
  if(urlOfAnchor.invalidNumOfLinks > 0) {
    urlOfAnchor.percentage = calculatePercentage(urlOfAnchor.totalNumOfLinks, urlOfAnchor.invalidNumOfLinks);
  }

  return urlOfAnchor;
}


function serverFormHandlerStatistics(form, parsedUrl){
  let sfh = {value:PHISHING_CLASS.suspicious};
  let nextUrl = null;

  if(!form.hasForm && !form.formArray){
     sfh.value = PHISHING_CLASS.legitimate;
     return sfh;
  }

  form.actionArray.forEach(function (url) {
    if(typeof url === "string") {
      nextUrl = urlParser.parse(url);

      if (nextUrl && parsedUrl && (validUrl.isHttpUri(nextUrl.href) || validUrl.isHttpsUri(nextUrl.href))) {
        if (nextUrl.hostname && parsedUrl.hostname && nextUrl.hostname === parsedUrl.hostname) {
          if (nextUrl.path === parsedUrl.path && nextUrl.hash === HASH) {
             sfh.value = PHISHING_CLASS.phishing;
          }
          else {
            sfh.value = PHISHING_CLASS.legitimate;
          }
        }
        else if (nextUrl.hostname && parsedUrl.hostname && nextUrl.hostname !== parsedUrl.hostname) {
          sfh.value = PHISHING_CLASS.suspicious;
        }
        else {
          sfh.value = PHISHING_CLASS.phishing;
        }
      }
      else if (url && url.toLowerCase() === ABOUT_BLANK) {
         sfh.value = PHISHING_CLASS.phishing;
      }
    }
    });
    return sfh;
}

function getTextInputFieldsStatistics(inputFieldsArray){
  let inputFields = {
    numOfTextFields: 0,
    numOfPasswordFields:0
  }
  inputFieldsArray.forEach(function (inputFieldType) {
    if(inputFieldType.trim() === INPUT_TYPE_TEXT || inputFieldType.trim() === INPUT_TYPE_EMAIL || inputFieldType.trim() === INPUT_TYPE_TEL){
      inputFields.numOfTextFields = inputFields.numOfTextFields +1;
    }
    else if(inputFieldType.trim() === INPUT_TYPE_PASSWORD){
      inputFields.numOfPasswordFields = inputFields.numOfPasswordFields +1;
    }
  })
  return inputFields;
}


function extractValuablePhishingAttributesFromApiResults(results){

    let scanModel = {};

    if(results){

      scanModel.scanDate = moment();
      scanModel.isBlacklisted = false;
      scanModel.statistics = {};

      if(results.google_safe_browsing_api){
        scanModel.googleBlackList = {};
        if(results.google_safe_browsing_api.matches && results.google_safe_browsing_api.matches.length > 0){
          scanModel.googleBlackList.treats = [];
          scanModel.isBlacklisted = true;
          results.google_safe_browsing_api.matches.forEach(function (treat) {
            let newTreat = {};
            newTreat.type = treat.threatType;
            newTreat.platofrm = treat.platformType;
            scanModel.googleBlackList.treats.push(newTreat);
          })
        }
      }
      if(results.scrap_page){
        scanModel.crawlerResults = {};
        scanModel.crawlerResults.urlOfAnchorsStats = urlOfAnchorStatistics(results.scrap_page.hrefArray, results.parse_url);
        scanModel.statistics.urlOfAnchors = {percentage:0};
        scanModel.statistics.requestUrls = {percentage:0};
        scanModel.statistics.linksInTags = {percentage:0};
        if(scanModel.crawlerResults.urlOfAnchorsStats.totalNumOfLinks === 0){
          scanModel.statistics.urlOfAnchors = {percentage:100};
          scanModel.crawlerResults.urlOfAnchorsStats.percentage = 100;
        }
        else {
          scanModel.statistics.urlOfAnchors.percentage = scanModel.crawlerResults.urlOfAnchorsStats.percentage;
        }
        scanModel.crawlerResults.requestUrlsStats = urlOfAnchorStatistics(results.scrap_page.reqURLArray, results.parse_url, REQUEST_URLS);
        scanModel.statistics.requestUrls.percentage = scanModel.crawlerResults.requestUrlsStats.percentage;

        scanModel.crawlerResults.linksInTagsStats = urlOfAnchorStatistics(results.scrap_page.linksInTags, results.parse_url, LINKS_IN_TAGS);
        if(scanModel.crawlerResults.linksInTagsStats.totalNumOfLinks === 0){
          scanModel.statistics.linksInTags = {percentage:100};
          scanModel.crawlerResults.linksInTagsStats.percentage = 100;
        }
        else {
          scanModel.statistics.linksInTags.percentage = scanModel.crawlerResults.linksInTagsStats.percentage;
        }
        scanModel.crawlerResults.serverFormHandler = results.scrap_page.formObject;
        scanModel.statistics.sfh = serverFormHandlerStatistics(results.scrap_page.formObject, results.parse_url);
        scanModel.crawlerResults.iFrame = results.scrap_page.iFrameArray;
        scanModel.statistics.iframe = {value: PHISHING_CLASS.legitimate};
        if(results.scrap_page.iFrameArray.length > 0) {
          scanModel.statistics.iframe.value = PHISHING_CLASS.phishing;
        }
        scanModel.crawlerResults.inputs = results.scrap_page.inputTextArray;
        scanModel.statistics.inputFields = getTextInputFieldsStatistics(results.scrap_page.inputTextArray);
      }
      if(results.unshort_url){
        scanModel.statistics.tinyURL = {value: PHISHING_CLASS.legitimate}
        scanModel.unshortUrl = results.unshort_url;
        if(scanModel.unshortUrl.isShortenedURL) {
          scanModel.statistics.tinyURL.value = PHISHING_CLASS.phishing;
        }
      }
      if(results.parse_url){
        scanModel.statistics.atSymbol = {value: PHISHING_CLASS.legitimate};
        scanModel.statistics.hasPrefixOrSufix = {value: PHISHING_CLASS.legitimate};
        scanModel.statistics.subdomains = {count:0};
        scanModel.statistics.isIPAddress = {value: PHISHING_CLASS.legitimate};
        scanModel.statistics.urlLenght = {count:0};
        scanModel.parsedUrl = results.parse_url;
        if(scanModel.parsedUrl.atSimbol) {
          scanModel.statistics.atSymbol.value = PHISHING_CLASS.phishing;
        }
        if(scanModel.parsedUrl.prefixSufix) {
          scanModel.statistics.hasPrefixOrSufix.value = PHISHING_CLASS.phishing;
        }

        if(scanModel.parsedUrl.hasSubdomain) {
          scanModel.statistics.subdomains.count = scanModel.parsedUrl.dotsInSubdomainCout + 1;
        }
        if(scanModel.parsedUrl.isUrlIPAddress) {
          scanModel.statistics.isIPAddress.value = PHISHING_CLASS.phishing;
        }

        scanModel.statistics.urlLenght.count = scanModel.parsedUrl.urlLenght;

        if(results.parse_url.href) {
          scanModel.url = results.parse_url.href;
        }

        scanModel.urlStatisitcs = {
          topPhishingDomain: false,
          topPhishingDomainValue: "",
          topPhishingSubDomain: false,
          topPhishingSubDomainValue: "",
          topPhishingIP: false,
          topPhishingIPValue: "",
          topPhishingKeyword: false,
          topPhishingKeywordValue: "",
          whitelistedDomain: false,
          whitelistedDomainValue: ""
        };

        scanModel.statistics.keywordDomainReport = {value: PHISHING_CLASS.legitimate};

        let target = null;
        let targetWithPath = null;
        let targetHostname = null;

        if(results.parse_url.hostname){

          targetWithPath = results.parse_url.hostname;
          targetHostname = results.parse_url.hostname;

          if(results.parse_url.tokenizeHost){
            target = results.parse_url.tokenizeHost.domain + "." + results.parse_url.tokenizeHost.tld;
            targetHostname = removeWWWSubdomainFromURL(targetHostname);
          }
          else{
            target = results.parse_url.hostname;
          }

          if(results.parse_url.pathname) {
            targetWithPath = results.parse_url.hostname + results.parse_url.pathname;
          }


          scanModel.urlStatisitcs.topPhishingKeyword = _.some(TOP_PHISHING_KEYWORDS, function(keyword){
            scanModel.urlStatisitcs.topPhishingKeywordValue = keyword;
            return _.includes(targetWithPath.toLowerCase(), keyword);
          });

          scanModel.urlStatisitcs.topPhishingDomain = _.some(TOP_PHISHING_DOMAINS, function (url) {
            return url === target
          });

          scanModel.urlStatisitcs.topPhishingSubDomain = _.some(TOP_PHISHING_SUB_DOMAINS, function (url) {
            console.log("TARGET HOSTNAME: ", targetHostname);
            return url === targetHostname
          });


          if(results.parse_url.ipAddress) {
            scanModel.urlStatisitcs.topPhishingIP = _.some(TOP_PHISHING_IP_ADDRESSES, function (ip) {
              return ip === results.parse_url.ipAddress
            });
          }

          if(scanModel.urlStatisitcs.topPhishingDomain){
            scanModel.urlStatisitcs.topPhishingDomainValue = target;
          }

          if(scanModel.urlStatisitcs.topPhishingSubDomain){
            scanModel.urlStatisitcs.topPhishingSubDomainValue = targetHostname;
          }

          if(scanModel.urlStatisitcs.topPhishingIP){
            scanModel.urlStatisitcs.topPhishingIPValue = target;
          }

          if(!scanModel.urlStatisitcs.topPhishingSubDomain && !scanModel.urlStatisitcs.topPhishingIP && !scanModel.urlStatisitcs.topPhishingDomain){
            scanModel.urlStatisitcs.whitelistedDomain = _.some(WHITELISTED_DOMAINS, function (urlWhitelisted) {
              return urlWhitelisted === target
            });
          }

          if(scanModel.urlStatisitcs.whitelistedDomain){
            scanModel.urlStatisitcs.whitelistedDomainValue = target;
          }

          if(scanModel.urlStatisitcs.topPhishingIP || scanModel.urlStatisitcs.topPhishingDomain
            || scanModel.urlStatisitcs.topPhishingKeyword || scanModel.urlStatisitcs.topPhishingSubDomain){
            scanModel.statistics.keywordDomainReport.value = PHISHING_CLASS.phishing;
          }
          if(scanModel.urlStatisitcs.whitelistedDomain && !scanModel.urlStatisitcs.topPhishingSubDomain){
            scanModel.statistics.keywordDomainReport.value = PHISHING_CLASS.legitimate;
          }

        }

      }
      if(results.alexa_ranking){
        scanModel.alexa = {};
        scanModel.statistics.websiteTrafficAlexa = {rank: UNKNOWN};
        if(results.alexa_ranking.rank) {
          scanModel.alexa.rank = results.alexa_ranking.rank;
          scanModel.alexa.isRanked = true;
          scanModel.statistics.websiteTrafficAlexa.rank = results.alexa_ranking.rank;
        }
        else{
          scanModel.alexa.isRanked = false;
        }
      }
      if(results.whois_lookup && results.whois_lookup.WhoisRecord){

       scanModel.whoisRecord = {
          createdDate: null,
          updatedDate: null,
          expiresDate: null,
          lookupDate: new Date(),
          domainAgeDays: UNKNOWN,
          expiresInDays: UNKNOWN
        }

        if(results.whois_lookup.WhoisRecord.registryData) {
          if (results.whois_lookup.WhoisRecord.registryData.createdDateNormalized) {
            scanModel.whoisRecord.createdDate = moment(results.whois_lookup.WhoisRecord.registryData.createdDateNormalized,WHOIS_DATE_FORMAT);
          }
          if (results.whois_lookup.WhoisRecord.registryData.updatedDateNormalized) {
            scanModel.whoisRecord.updatedDate = moment(results.whois_lookup.WhoisRecord.registryData.updatedDateNormalized,WHOIS_DATE_FORMAT);
          }
          if (results.whois_lookup.WhoisRecord.registryData.expiresDateNormalized) {
            scanModel.whoisRecord.expiresDate = moment(results.whois_lookup.WhoisRecord.registryData.expiresDateNormalized,WHOIS_DATE_FORMAT);
          }
        }

        if (scanModel.whoisRecord.updatedDate && scanModel.whoisRecord.expiresDate) {
          let from = scanModel.whoisRecord.updatedDate;
          let to = scanModel.whoisRecord.expiresDate;
          scanModel.whoisRecord.expiresInDays = to.diff(from, "days");
        } else if (scanModel.whoisRecord.createdDate && scanModel.whoisRecord.expiresDate) {
          let from = scanModel.whoisRecord.createdDate;
          let to = scanModel.whoisRecord.expiresDate;
          scanModel.whoisRecord.expiresInDays = to.diff(from, "days");
        }

        if(results.whois_lookup.WhoisRecord.estimatedDomainAge){
          scanModel.whoisRecord.domainAgeDays = results.whois_lookup.WhoisRecord.estimatedDomainAge;
        }
        else if(scanModel.whoisRecord.createdDate){
          let from = scanModel.whoisRecord.createdDate;
          let to = moment();
          scanModel.whoisRecord.domainAgeDays = to.diff(from, "days");
        }

        scanModel.statistics.ageOfDomain = {days:UNKNOWN};
        scanModel.statistics.domainRegistrationLength = {days:UNKNOWN};

        if(scanModel.whoisRecord.domainAgeDays >= 0) {
          scanModel.statistics.ageOfDomain.days = scanModel.whoisRecord.domainAgeDays;
        }
        if(scanModel.whoisRecord.expiresInDays >= 0) {
          scanModel.statistics.domainRegistrationLength.days = scanModel.whoisRecord.expiresInDays;
        }

      }
      if(results.ssl_check){
        scanModel.sslCertificate = {
          issuer: null,
          san_entries: [],
          existInSANEntries: false,
          trustedCA: false,
          certType: null,
          completeCertChain: false,
          isRevoked: false,
          validFrom: null,
          validTo: null,
          certificateDuration: UNKNOWN,
          expiresIn: UNKNOWN
        }
        scanModel.statistics.ssl = {value: PHISHING_CLASS.suspicious};
        if(results.ssl_check.response) {
          if (results.ssl_check.response.issuer) {
            scanModel.sslCertificate.issuer = results.ssl_check.response.issuer.CN;
          }
          if(results.ssl_check.response.valid_from){
            console.log("valid from date ssl");
            scanModel.sslCertificate.validFrom = moment(results.ssl_check.response.valid_from);
          }
          if(results.ssl_check.response.valid_to){
            console.log("valid to date ssl");
            scanModel.sslCertificate.validTo = moment(results.ssl_check.response.valid_to);
          }
          if(results.ssl_check.response.san_entries){
            scanModel.sslCertificate.san_entries = results.ssl_check.response.san_entries;
            if(results.ssl_check.response.subject && results.ssl_check.response.subject.CN) {
              console.log("Subject CN: ", results.ssl_check.response.subject.CN);
              scanModel.sslCertificate.existInSANEntries = _.some(scanModel.sslCertificate.san_entries, function (url) {
                return url === results.ssl_check.response.subject.CN
              });
            }
          }
          if(results.ssl_check.response.cert_type){
            scanModel.sslCertificate.certType = results.ssl_check.response.cert_type;
          }
          if(results.ssl_check.response.chain_of_trust_complete){
            scanModel.sslCertificate.completeCertChain = results.ssl_check.response.chain_of_trust_complete;
          }
          if(results.ssl_check.response.revoked){
            scanModel.sslCertificate.isRevoked = results.ssl_check.response.revoked;
          }
          if(!results.ssl_check.response.self_signed){
            scanModel.sslCertificate.trustedCA = true;
          }
          if(results.ssl_check.response.cert_type){
            scanModel.sslCertificate.certType = results.ssl_check.response.cert_type;
          }
          if(scanModel.sslCertificate.validFrom && scanModel.sslCertificate.validTo){
            let from = scanModel.sslCertificate.validFrom;
            let to = scanModel.sslCertificate.validTo;
            scanModel.sslCertificate.certificateDuration = to.diff(from, "days");
            scanModel.sslCertificate.expiresIn = to.diff(moment(), "days");
          }

          scanModel.statistics.ssl = {
            duration: scanModel.sslCertificate.certificateDuration,
            isTrusted: scanModel.sslCertificate.trustedCA,
            expiresIn: scanModel.sslCertificate.expiresIn,
            completeCertChain: scanModel.sslCertificate.completeCertChain,
          };
        }
        else{
          scanModel.statistics.ssl.value = PHISHING_CLASS.phishing;
        }
      }
      if(results.mozscape_api_call){
        let mozscape = results.mozscape_api_call;
        scanModel.mozscape = {};
        for (let prop in mozscape) {
          if (mozscape.hasOwnProperty(prop)) {
            let propName = MOZCAPE[prop].name;
            scanModel.mozscape[propName] = mozscape[prop];
          }
        }
       /* scanModel.statistics.mozscape = {
          mozRankURL: scanModel.mozscape.mozRankURLNormalized,
          pageAuthority: scanModel.mozscape.pageAuthority,
          domainAuthority: scanModel.mozscape.domainAuthority,
          externalLinks: scanModel.mozscape.externalEquityLinks
        }*/

        scanModel.statistics.mozRankURL = {
          count: scanModel.mozscape.mozRankURLNormalized
        };

        scanModel.statistics.pageAuthority = {
          count: scanModel.mozscape.pageAuthority
        };

        scanModel.statistics.domainAuthority = {
          count: scanModel.mozscape.domainAuthority
        };

        scanModel.statistics.externalLinks = {
          count: scanModel.mozscape.externalEquityLinks
        }
      }
      if(results.my_wot_reputation && results.parse_url){
        let hostName = results.parse_url.hostname;
        scanModel.myWOT = {
          hasWOTStatistics: false,
          isBlacklisted: false
        };
        scanModel.statistics.myWOT = {count: MY_WOT.REPUTATION.UNKNOWN.VALUE};

        if (results.my_wot_reputation[hostName]){
          if(results.my_wot_reputation[hostName][MY_WOT.TRUSTWORTHINESS]) {
            scanModel.myWOT.trustworthiness = results.my_wot_reputation[hostName][MY_WOT.TRUSTWORTHINESS];
            scanModel.myWOT.hasWOTStatistics = true;
            scanModel.statistics.myWOT.count = scanModel.myWOT.trustworthiness[0];
           }
          if (results.my_wot_reputation[hostName][MY_WOT.CHILD_SAFETY]) {
            scanModel.myWOT.childSafety = results.my_wot_reputation[hostName][MY_WOT.CHILD_SAFETY];
            scanModel.myWOT.hasWOTStatistics = true;
          }
          if (results.my_wot_reputation[hostName][MY_WOT.CATEGORIES]) {
              scanModel.myWOT.hasWOTStatistics = true;
              let categories = results.my_wot_reputation[hostName][MY_WOT.CATEGORIES];
              scanModel.myWOT.categories = [];
              for (let prop in categories) {
                if (categories.hasOwnProperty(prop)) {
                  let category = {};
                  category.description = switchMyWOTCategories(prop);
                  category.code = prop;
                  category.value = categories[prop];
                  scanModel.myWOT.categories.push(category);
                }
              }
          }
          if(results.my_wot_reputation[hostName][MY_WOT.BLACKLISTS]){
            scanModel.myWOT.hasWOTStatistics = true;
            scanModel.myWOT.isBlacklisted = true;
            scanModel.isBlacklisted = true;
            let blacklists = results.my_wot_reputation[hostName][MY_WOT.BLACKLISTS];
            scanModel.myWOT.blacklists = [];
            for (let prop in blacklists) {
              if (blacklists.hasOwnProperty(prop)) {
                let blacklist = {};
                console.log(prop + " -> " + blacklists[prop]);
                blacklist.description = switchWOTBlacklists(prop);
                blacklist.type = prop;
                blacklist.blacklistedOn = new Date(blacklists[prop] * 1000);
                scanModel.myWOT.blacklists.push(blacklist);
              }
            }
          }

        }
      }
      return scanModel;
    }
    else{
      return null;
    }
}

function calculateEvaluationMetrics(aggregatedStatistics){
  let evaluationMetrics ={};

  if(aggregatedStatistics){

    aggregatedStatistics.forEach(function(element){
      if(element._id.target === PHISHING_CLASS.phishing){
        evaluationMetrics.phishingWebsitesCount = element.totalCountPerClass;
        evaluationMetrics.phishingWebsitesResponseTime = element.responseTime;
        evaluationMetrics.correctlyClassifiedPhishingInstances = element.finalScoreAbove50;
        evaluationMetrics.incorrectlyClassifiedPhishingInstances = element.finalScoreBelowOrEqual50;
      }
      else if(element._id.target === PHISHING_CLASS.legitimate){
        evaluationMetrics.legitimateWebsitesCount = element.totalCountPerClass;
        evaluationMetrics.legitimateWebsitesResponseTime = element.responseTime;
        evaluationMetrics.correctlyClassifiedLegitimateInstances = element.finalScoreBelowOrEqual50;
        evaluationMetrics.incorectlyClassifiedLegitimateInstances = element.finalScoreAbove50;
      }
    });

    evaluationMetrics.totalCount = evaluationMetrics.phishingWebsitesCount + evaluationMetrics.legitimateWebsitesCount;

    let truePositiveRate = evaluationMetrics.correctlyClassifiedPhishingInstances /
      (evaluationMetrics.correctlyClassifiedPhishingInstances + evaluationMetrics.incorrectlyClassifiedPhishingInstances);

    evaluationMetrics.truePositiveRate = Math.round((truePositiveRate * 10000)) / 10000;

    evaluationMetrics.truePositiveRatePrc = Math.round((evaluationMetrics.truePositiveRate * 100) * 100) / 100;

    let falsePositiveRate = evaluationMetrics.incorectlyClassifiedLegitimateInstances /
      (evaluationMetrics.incorectlyClassifiedLegitimateInstances + evaluationMetrics.correctlyClassifiedLegitimateInstances);

    evaluationMetrics.falsePositiveRate = Math.round((falsePositiveRate * 10000)) / 10000;

    evaluationMetrics.falsePositiveRatePrc = Math.round((evaluationMetrics.falsePositiveRate * 100) * 100) / 100;

    let trueNegativeRate = evaluationMetrics.correctlyClassifiedLegitimateInstances /
      (evaluationMetrics.correctlyClassifiedLegitimateInstances + evaluationMetrics.incorectlyClassifiedLegitimateInstances);

    evaluationMetrics.trueNegativeRate = Math.round((trueNegativeRate * 10000)) / 10000;

    evaluationMetrics.trueNegativeRatePrc = Math.round((evaluationMetrics.trueNegativeRate * 100) * 100) / 100;

    let falseNegativeRate = evaluationMetrics.incorrectlyClassifiedPhishingInstances /
      (evaluationMetrics.correctlyClassifiedPhishingInstances + evaluationMetrics.incorrectlyClassifiedPhishingInstances);

    evaluationMetrics.falseNegativeRate = Math.round((falseNegativeRate * 10000)) / 10000;

    evaluationMetrics.falseNegativeRatePrc = Math.round((evaluationMetrics.falseNegativeRate * 100) * 100) / 100;

    let precision = evaluationMetrics.correctlyClassifiedPhishingInstances /
      (evaluationMetrics.incorectlyClassifiedLegitimateInstances + evaluationMetrics.correctlyClassifiedPhishingInstances );

    evaluationMetrics.precision = Math.round((precision * 10000)) / 10000;

    evaluationMetrics.precisionPrc = Math.round((evaluationMetrics.precision * 100) * 100) / 100;

    let accuracy = (evaluationMetrics.correctlyClassifiedPhishingInstances +  evaluationMetrics.correctlyClassifiedLegitimateInstances)
      / evaluationMetrics.totalCount;

    evaluationMetrics.accuracy = Math.round((accuracy * 10000)) / 10000;

    evaluationMetrics.accuracyPrc = Math.round((evaluationMetrics.accuracy * 100) * 100) / 100;

    let harmonicMean = (2 * evaluationMetrics.truePositiveRate * evaluationMetrics.precision) /
      (evaluationMetrics.truePositiveRate + evaluationMetrics.precision);

    evaluationMetrics.harmonicMean = Math.round((harmonicMean * 10000)) / 10000;
  }

  return evaluationMetrics;

}

function myWOT(url,cb){

  var options = {
    method: 'GET',
    uri: config.api_endpoints.my_wot,
    qs: {
      hosts: url,
      key: config.secrets.my_wot.key // -> uri + '?hosts=xxxxx%20xxxxx'
    },
    json: true // Automatically parses the JSON string in the response
  };

  rp(options)
    .then(function (res) {
      cb(null, res)
    }, function (err) {
      cb(err, null)
    });

}


function mozscapeApiCall(url,cb){

  // Set your expires times for several minutes into the future.
  // An expires time excessively far in the future will not be honored by the Mozscape API.
  // Divide the result of Date.now() by 1000 to make sure your result is in seconds.
  let expires = Math.round((new Date().getTime()) / 1000 + 300);
  //var expires = Date.now() + 300;
  let apiUrl = config.api_endpoints.mozscape_api + "/" + encodeURIComponent(url);
  let accessID = config.secrets.moz.accessId;
  let secretKey = config.secrets.moz.secretKey;

  // Put each parameter on a new line.
  let stringToSign = accessID + "\n" + expires;

  //create the hmac hash and Base64-encode it.
  let signature = crypto.createHmac('sha1', secretKey).update(stringToSign).digest('base64');
  let auth = Buffer.from(`${accessID}:${secretKey}`).toString('base64');

  //URL-encode the result of the above.
  signature = encodeURIComponent(signature);

  var options = {
    method: 'GET',
    uri: apiUrl,
    qs: {
      Cols: config.secrets.moz.cols_extended,
      AccessID: accessID,
      Expires: expires,
      Signature: signature
    },
    headers: {
      Authorization: `Basic ${auth}`
    },
    json:true
  };

  rp(options)
    .then(function (res) {
      cb(null, res)
    }, function (err) {
      cb(err, null)
    });

}

function whoisLookup(url,cb){

  var options = {
    method: 'GET',
    uri: config.api_endpoints.whois_lookup,
    qs: {
      domain: url
    },
    headers: {
      'Authorization': 'Token token=c91c162c070db8939cdaae76cb4b6b35'
    },
    json: true // Automatically parses the JSON string in the response
  };

  rp(options)
    .then(function (res) {
      cb(null, res)
    })
    .catch(function (err) {
      cb(err, null)
    });

}


function whoisXmlApi(url,cb){

  var options = {
    method: 'GET',
    uri: config.api_endpoints.whois_xml_api,
    qs: {
      domainName: url,
      username: config.secrets.whois_xml_api.username,
      password: config.secrets.whois_xml_api.password,
      outputFormat: 'JSON'
    },
    json: true // Automatically parses the JSON string in the response
  };

  rp(options)
    .then(function (res) {
      console.log("Enters in then!");
      return cb(null, res)
    }, function (err) {
        console.log("Api error returned, request unsucessful!");
        return cb(err)
    });

}

function sslCheck(parsedUrl,cb){
  let response = {isHTTPS: false};
  if(parsedUrl.protocol === HTTPS) {
    var options = {
      method: 'POST',
      uri: config.api_endpoints.ssl_check,
      body: {
        url: parsedUrl.hostname,
        ip: parsedUrl.ipAddress,
        path: parsedUrl.path,
        port: '443',
        live_scan: 'true'
      },
      json: true // Automatically parses the JSON string in the response
    };

    rp(options)
      .then(function (res) {
        cb(null, res)
      }, function (err) {
        cb(err, null)
      });
  }
  else
  {
    cb(null, response)
  }

}


function googleBlackListLookup(url,cb){
    let options = {
      method: 'POST',
      uri: config.api_endpoints.google_safe_browsing_api,
      qs: {
        key: config.secrets.google_safe_browsing_api.key
      },
      body: {
        client:{
          clientId: "phishedupro",
          clientVersion: "1.0.0"
        },
        threatInfo: {
          threatTypes: ["SOCIAL_ENGINEERING"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [
            {url: url}
          ]
        }
      },
      json: true // Automatically parses the JSON string in the response
    };

    rp(options)
      .then(function (res) {
        cb(null, res)
      }, function (err) {
        cb(err, null)
      });


}

export function generateStats(cb) {
  Scan.aggregate([
    {
      $match: {
        target: { $ne: null},
      }
    },
    {
      $group : {
        _id : {target:"$target", active:"active"},
        totalCountPerClass: { $sum: 1 },
        responseTime: {$avg:"$responseTime"},
        finalScoreAbove50: { $sum : { $cond : { if : { $gte : [ "$finalScore", 52 ] } ,
          then : 1,
          else : 0}}},
        finalScoreBelowOrEqual50:{ $sum : { $cond : { if : { $lt : [ "$finalScore", 52 ] } ,
          then : 1,
          else : 0}}}
      }},
    {
      $project: {
        "totalCountPerClass":1,
        "responseTime":1,
        "finalScoreAbove50":1,
        "finalScoreBelowOrEqual50": 1
      }
    }],function (err, result) {
    if (!err) {
      let evaluationMetrics = calculateEvaluationMetrics(result);
      cb(null, evaluationMetrics);
    } else {
      cb(err, null);
    }
  })
};

export function checkURL(scan,cb){
  async.auto({
    ping_website: function(callback) {
      checkUrlExists(scan.url, function(err, result){
        if (!err) {
          //console.log(result);
          callback(null, result);
        } else {
          //console.log(err);
          callback(err, result);
        }
      })
    },
    scrap_page: ['ping_website', function(results, callback) {
      var nightmare = Nightmare({ show: true });
      console.log('it enters');
      nightmare
        .goto(scan.url)
        .wait(2051)
        .evaluate(function () {
          let hrefArray = [];
          let reqURLArray = [];
          let formArray = [];
          let iFrameArray = [];
          let inputTextArray = [];
          let linksInTags = [];

          let linksInTagsTemp = document.querySelectorAll("link, script");
          for (let i=0;i<linksInTagsTemp.length;i++) {
            if (linksInTagsTemp[i].href) {
              linksInTags.push(linksInTagsTemp[i].href);
            }
            else if (linksInTagsTemp[i].src) {
              linksInTags.push(linksInTagsTemp[i].src);
            }
          }

          let hrefArrayTemp = document.querySelectorAll("a");
          for (let i=0;i<hrefArrayTemp.length;i++) {
            if (hrefArrayTemp[i].href)
              hrefArray.push(hrefArrayTemp[i].href);
          }

          let reqURLArrayTemp = document.querySelectorAll("img, embed, video, audio, source");
          for (let i=0;i<reqURLArrayTemp.length;i++) {
            if (reqURLArrayTemp[i].src)
              reqURLArray.push(reqURLArrayTemp[i].src);
          }


          let formArrayTemp = document.querySelectorAll("form");
          let formObject = {hasForm:false};
          if(formArrayTemp && formArrayTemp.length > 0) {
            formObject.hasForm = true;

            for (let i = 0; i < formArrayTemp.length; i++) {

              if (formArrayTemp[i].action)
                formArray.push(formArrayTemp[i].action);
            }
            formObject.actionArray = formArray;
          }

          let iFrameArrayTemp = document.querySelectorAll("iframe");
          for (let i=0;i<iFrameArrayTemp.length;i++) {
            if (iFrameArrayTemp[i].src)
              iFrameArray.push(iFrameArrayTemp[i].src);
          }


          let inputTextArrayTemp = document.querySelectorAll("input[type='password'], input[type='text']," +
            " input[type='email'], input[type='tel']");
          for (let i=0;i<inputTextArrayTemp.length;i++) {
            if (inputTextArrayTemp[i])
              inputTextArray.push(inputTextArrayTemp[i].type);
          }

          let urlAddressBar = window.location.href;


          return {
            "hrefArray": hrefArray,
            "reqURLArray": reqURLArray,
            "linksInTags": linksInTags,
            "formObject": formObject,
            "iFrameArray": iFrameArray,
            "inputTextArray": inputTextArray,
            "finalUrl": urlAddressBar
          };
        })
        .end()
        .then(function (result) {
          callback(null, result);
        }, function (error) {
          callback(error, null);
        });

    }],
    unshort_url: ['ping_website', function(results, callback) {
      tall(scan.url)
        .then(function(unshortenedUrl) {
          let urlObject = {};
          urlObject.isShortenedURL = false;
          let originalUrl = scan.url;
          urlObject.originalUrl = originalUrl;
          urlObject.unshortUrl = null;

          if(originalUrl !== unshortenedUrl && validUrl.isUri(unshortenedUrl)) {

            let originalParsedUrl =  urlParser.parse(originalUrl);
            let unshortenedParsedUrl = urlParser.parse(unshortenedUrl);

            if(originalParsedUrl && unshortenedParsedUrl && originalParsedUrl.hostname && unshortenedParsedUrl.hostname
              && originalParsedUrl.hostname !== unshortenedParsedUrl.hostname)
              urlObject.isShortenedURL = true;
            urlObject.unshortUrl = unshortenedUrl;
          }

          console.log('Tall url', unshortenedUrl);
          console.log('Original url', originalUrl);

          callback(null, urlObject);
        },function(err) {
          callback(err, null);
        });
      ;
    }],
    url_lookup_db: ['scrap_page', function(results, callback) {
      console.log("Enters in url_db_lookup");
      Scan.findOne({ 'url': results.scrap_page.finalUrl },  function (err, result) {
        if (err)
          return callback(err, null);
        if(result){
          Rule.find().lean().execAsync()
            .then(function(rules) {
              result.rules = rules;
              return callback(null, result);
            })
        }
        else {
          return callback(null, result);
        }
      }).lean()
    }]}, function(err, results) {
      if(!err) {
        console.log(err);
        scan.checkUrl = results;
        scan.checkUrl.get_final_url = {finalUrl: scan.checkUrl.scrap_page.finalUrl};
        return cb(null, scan);
      }
      else{
        if(err && err.isOnline === false){
          let result = {message: SCAN_ERROR_MESSAGES.WEBSITE_NOT_ACCESSIBLE};
          return cb(null, result);
        }
        else if(err && err.message === SCAN_ERROR_MESSAGES.CRAWLER_NAVIGATION_ERROR){
          let result = {message: SCAN_ERROR_MESSAGES.CRAWLER_NAVIGATION_ERROR};
          return cb(null, result);
        }
        else {
          return cb(err, "An error in checkURL function has occurred!");
        }
      }
    });
}

export function scanURLAndExtractFeatures(scan, cb){
  let url = scan.url;
  let target = scan.target;
  let owner = scan.owner;
  let finalURL = scan.checkUrl.get_final_url;
  let unshort_url = scan.checkUrl.unshort_url;
  async.auto({
    parse_url: function(callback) {
      let myUrl = null;
      if(finalURL && (validUrl.isHttpUri(finalURL.finalUrl) || validUrl.isHttpsUri(finalURL.finalUrl)))
        myUrl = urlParser.parse(finalURL.finalUrl);
      else if (unshort_url && unshort_url.unshortUrl && (validUrl.isHttpUri(unshort_url.unshortUrl) || validUrl.isHttpsUri(unshort_url.unshortUrl)))
        myUrl = urlParser.parse(unshort_url.unshortUrl);
      else
        myUrl = urlParser.parse(url);

        myUrl.isUrlIPAddress = ipaddr.isValid(myUrl.hostname);
        if (!myUrl.isUrlIPAddress) {
          myUrl.tokenizeHost = parseDomain(myUrl.hostname);
        }
        myUrl.urlLenght = myUrl.href.length;
        myUrl.atSimbol = myUrl.href.indexOf("@") > -1 ? true : false;
        myUrl.prefixSufix = myUrl.hostname.indexOf("-") > -1 ? true : false;
        myUrl.dotsInSubdomainCout = 0;
        myUrl.hasSubdomain = false;
        if (myUrl.tokenizeHost) {
          let filteredSubdomain = removeWWWSubdomainFromURL(myUrl.tokenizeHost.subdomain);
          console.log("FILTERED DOMAIN: ", filteredSubdomain);
          myUrl.dotsInSubdomainCout = count(filteredSubdomain, DOT_CHARACTER);
          if (filteredSubdomain)
            myUrl.hasSubdomain = true;
        }

        dns.lookup(myUrl.hostname, function (err, address, family) {
          console.log('address: %j family: IPv%s', address, family);
          myUrl.ipAddress = address;
          myUrl.ipFamily = family;
          console.log(myUrl);
          if(!err) {
            callback(null, myUrl);
          }
          else {
            callback(err, myUrl);
          }

        });
    },
    alexa_ranking: ['parse_url', function(results, callback) {
      alexa(results.parse_url.href, function(error, result) {
        if (!error) {
          console.log(result);
          callback(null, result);
        } else {
          console.log(error);
          callback(error, result);
        }
      });
    }],
    my_wot_reputation: ['parse_url', function(results, callback) {
      myWOT(results.parse_url.href, function(err, result){
        if (!err) {
          //console.log(result);
          callback(null, result);
        } else {
          //console.log(err);
          callback(err, result);
        }
      })
    }],
    ssl_check: ['parse_url', function(results, callback) {
      sslCheck(results.parse_url, function(err, result){
        if (!err) {
          /*console.log(result);*/
          callback(null, result);
        } else {
          console.log(err);
          callback(err, result);
        }
      })
    }],
    whois_lookup: ['parse_url', function(results, callback) {
      whoisXmlApi(results.parse_url.hostname, function(err, result){
        if (!err) {
          //console.log(result);
          console.log("Enters in whoisLookap right part");
          return  callback(null, result);
        } else {
          console.log(err);
          return callback(err);
        }
      })
    }],
    mozscape_api_call: ['parse_url', function(results, callback) {
      mozscapeApiCall(results.parse_url.href, function(err, result){
        if (!err) {
          console.log(result);
          callback(null, result);
        } else {
          console.log(err);
          callback(err, result);
        }
      })
    }],
    google_safe_browsing_api: ['parse_url', function(results, callback) {
      googleBlackListLookup(results.parse_url.href, function(err, result){
        if (!err) {
          console.log("BlackList: ",result);
          callback(null, result);
        } else {
          console.log(err);
          callback(err, result);
        }
      })
    }]
  }, function(err, results) {
    if(!err) {
      try {
        console.log("Enters in the last part of the algorthm");
        results = _.assign(results, scan.checkUrl);
        let scanStatistics = extractValuablePhishingAttributesFromApiResults(results);
        scanStatistics.target = target;
        scanStatistics.owner = owner;
        return cb(null, scanStatistics);
      } catch (error) {
        return cb(error, SCAN_ERROR_MESSAGES.ERROR_IN_SCAN_STATISTICS)
      }
    }
    else{
        return cb(err, "An error has occurred in scanURLAndExtractFeatures function!");
    }

  });
}
