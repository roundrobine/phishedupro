'use strict';
import config from '../../config/environment';
import _ from 'lodash';
const MY_WOT = require('./scan.config').MY_WOT;
const MOZCAPE = require('./scan.config').MOZCAPE;
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
const DOT_CHARACTER = '\\.';
const WWW = "www"
const HTTPS = 'https:';
const JAVA_SCRIPT_VOID_0 = "javascript:void(0)";
const LEGITIMATE = 1;
const PHISHING = -1;
const SUSPICIOUS = 0;
const ABOUT_BLANK = "about:blank";
const HASH = "#";
const INPUT_TYPE_TEXT = "text";
const INPUT_TYPE_PASSWORD = "password";
const INPUT_TYPE_EMAIL = "email";
const INPUT_TYPE_TEL = "tel";
const UNKNOWN = -2;
const WHOIS_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss Z";

var Nightmare = require('nightmare');

//count('Yes. I want. to. place a. lot of. dots.','\\.'); //=> 6
function count(url, character) {
  return ( url.match( RegExp(character,'g') ) || [] ).length;
}


function removeWWWSubdomainFromURL(url){
  if(url && url.length > 2 && url.substring(0,3).toLowerCase() === WWW)
    return url.substring(3);
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


function urlOfAnchorStatistics(anchorArray, parsedUrl){
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

  if(!parsedUrl.isUrlIPAddress)
    baseHostNoSubdomain = parsedUrl.tokenizeHost.domain + "." + parsedUrl.tokenizeHost.tld;

  anchorArray.forEach(function(url){
    newHostNoSubdomain = null;
    nextUrl = urlParser.parse(url);
    if(nextUrl && nextUrl.hostname)
      nextUrl.isUrlIPAddress = ipaddr.isValid(nextUrl.hostname);


    if (!nextUrl.isUrlIPAddress && nextUrl.hostname) {
      nextUrl.tokenizeHost = parseDomain(nextUrl.host);
      newHostNoSubdomain = nextUrl.tokenizeHost.domain + "." + nextUrl.tokenizeHost.tld;
    }
    if(nextUrl && parsedUrl && validUrl.isUri(nextUrl.href)) {
      if (nextUrl.hostname && parsedUrl.hostname && nextUrl.hostname === parsedUrl.hostname) {

        if (nextUrl.path === parsedUrl.path) {
          invalidLinks = invalidLinks + 1;
          urlOfAnchor.invalidLinksArray.push(nextUrl.href);
        }
        else if(nextUrl.href.toLowerCase() === JAVA_SCRIPT_VOID_0){
          invalidLinks = invalidLinks + 1;
          urlOfAnchor.invalidLinksArray.push(nextUrl.href);
        }
        else {
          validLinks = validLinks + 1;
          urlOfAnchor.validLinksArray.push(nextUrl.href);
        }
      }
      else if(newHostNoSubdomain && baseHostNoSubdomain && newHostNoSubdomain === baseHostNoSubdomain){
          validLinks = validLinks + 1;
          urlOfAnchor.validLinksArray.push(nextUrl.href);
      }
      else{
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
  let sfh = SUSPICIOUS;
  let nextUrl = null;

  if(!form.hasForm && !form.formArray){
    return sfh = LEGITIMATE;
  }

  form.actionArray.forEach(function (url) {
      nextUrl = urlParser.parse(url);

      if (nextUrl && parsedUrl && validUrl.isUri(nextUrl.href)) {
        if (nextUrl.hostname && parsedUrl.hostname && nextUrl.hostname === parsedUrl.hostname) {
          if (nextUrl.path === parsedUrl.path && nextUrl.hash === HASH) {
            return sfh = PHISHING;
          }
          else {
            sfh = LEGITIMATE;
          }
        }
        else if (nextUrl.hostname && parsedUrl.hostname && nextUrl.hostname !== parsedUrl.hostname) {
          sfh = SUSPICIOUS;
        }
        else {
          return sfh = PHISHING;
        }
      }
      else if (url && url.toLowerCase() === ABOUT_BLANK) {
        return sfh = PHISHING;
      }

    });
    return sfh;
}

function getTextInputFieldsStatistics(inputFieldsArray){
  let inputFiledsStatisitcs = {
    numOfTextfields: 0,
    numOfPasswordFields:0
  }
  inputFieldsArray.forEach(function (inputFieldType) {
    if(inputFieldType.trim() === INPUT_TYPE_TEXT || inputFieldType.trim() === INPUT_TYPE_EMAIL || inputFieldType.trim() === INPUT_TYPE_TEL){
      inputFiledsStatisitcs.numOfTextfields = inputFiledsStatisitcs.numOfTextfields +1;
    }
    else if(inputFieldType.trim() === INPUT_TYPE_PASSWORD){
      inputFiledsStatisitcs.numOfPasswordFields = inputFiledsStatisitcs.numOfPasswordFields +1;
    }
  })
  return inputFiledsStatisitcs;
}


function extractValuablePhishingAttributesFromApiResults(results){

    let scanModel = {};

    if(results){

      scanModel.statistics = {};
      if(results.scarp_page){
        scanModel.crawlerResults = {};
        scanModel.crawlerResults.urlOfAnchorsStats = urlOfAnchorStatistics(results.scarp_page.hrefArray, results.parse_url);
        if(scanModel.crawlerResults.urlOfAnchorsStats.totalNumOfLinks === 0){
          scanModel.statistics.urlOfAnchorPrc = 100;
          scanModel.crawlerResults.urlOfAnchorsStats.percentage = 100;
        }
        else {
          scanModel.statistics.urlOfAnchorPrc = scanModel.crawlerResults.urlOfAnchorsStats.percentage;
        }
        scanModel.crawlerResults.requestUrlsStats = urlOfAnchorStatistics(results.scarp_page.reqURLArray, results.parse_url);
        scanModel.statistics.requestUrlsPrc = scanModel.crawlerResults.requestUrlsStats.percentage;
        scanModel.crawlerResults.linksInTagsStats = urlOfAnchorStatistics(results.scarp_page.linksInTags, results.parse_url);
        scanModel.statistics.linksInTagsPrc = scanModel.crawlerResults.linksInTagsStats.percentage;
        scanModel.crawlerResults.serverFormHandler = results.scarp_page.formObject;
        scanModel.statistics.sfh = serverFormHandlerStatistics(results.scarp_page.formObject, results.parse_url);
        scanModel.crawlerResults.iFrame = results.scarp_page.iFrameArray;
        if(results.scarp_page.iFrameArray.length > 0) {
          scanModel.statistics.iframe = true;
        }
        else {
          scanModel.statistics.iframe = false;
        }
        scanModel.crawlerResults.inputs = results.scarp_page.inputTextArray;
        scanModel.statistics.inputFieldsStatistics = getTextInputFieldsStatistics(results.scarp_page.inputTextArray);
      }
      if(results.unshort_url){
        scanModel.unshortUrl = results.unshort_url;
        scanModel.statistics.tinyURL  = scanModel.unshortUrl.isShortenedURL;
      }
      if(results.parse_url){
        scanModel.parsedUrl = results.parse_url;
        scanModel.statistics.atSymbol = scanModel.parsedUrl.atSimbol;
        scanModel.statistics.hasPrefixOrSufix = scanModel.parsedUrl.prefixSufix;
        scanModel.statistics.subdomains = 0;
        if(scanModel.parsedUrl.hasSubdomain) {
          scanModel.statistics.subdomains = scanModel.parsedUrl.dotsInSubdomainCout + 1;
        }
        scanModel.statistics.isIPAddress = scanModel.parsedUrl.isUrlIPAddress;
        scanModel.statistics.urlLenght = scanModel.parsedUrl.urlLenght;

      }
      if(results.alexa_ranking){
        scanModel.alexa = {};
        scanModel.statistics.websiteTrafficAlexa = UNKNOWN;
        if(results.alexa_ranking.rank) {
          scanModel.alexa.rank = results.alexa_ranking.rank;
          scanModel.alexa.isRanked = true;
          scanModel.statistics.websiteTrafficAlexa = results.alexa_ranking.rank;
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

        if (scanModel.whoisRecord.createdDate && scanModel.whoisRecord.expiresDate) {
          let from = scanModel.whoisRecord.createdDate;
          let to = scanModel.whoisRecord.expiresDate;
          scanModel.whoisRecord.expiresInDays = to.diff(from, "days");
        }

        if(results.whois_lookup.WhoisRecord.estimatedDomainAge){
          scanModel.whoisRecord.domainAgeDays = results.whois_lookup.WhoisRecord.estimatedDomainAge;
        }

        scanModel.statistics.ageOfDomain = scanModel.whoisRecord.domainAgeDays;
        scanModel.statistics.domainRegistrationLength = scanModel.whoisRecord.expiresInDays;

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
            completeCertChain: scanModel.sslCertificate.completeCertChain
          };
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
        scanModel.statistics.mozscape = {
          mozRankURL: scanModel.mozscape.mozRankURLNormalized,
          pageAuthority: scanModel.mozscape.pageAuthority,
          domainAuthority: scanModel.mozscape.domainAuthority
        }
      }
      if(results.my_wot_reputation && results.parse_url){
        let hostName = results.parse_url.hostname;
        scanModel.myWOT = {
          hasWOTStatistics: false,
          isBlacklisted: false
        };
        scanModel.statistics.isBlacklisted = false;
        scanModel.statistics.myWOTReputation = MY_WOT.REPUTATION.UNKNOWN.VALUE;

        if (results.my_wot_reputation[hostName]){
          if(results.my_wot_reputation[hostName][MY_WOT.TRUSTWORTHINESS]) {
            scanModel.myWOT.trustworthiness = results.my_wot_reputation[hostName][MY_WOT.TRUSTWORTHINESS];
            scanModel.myWOT.hasWOTStatistics = true;
            scanModel.statistics.myWOTReputation = scanModel.myWOT.trustworthiness[0];
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
            scanModel.statistics.isBlacklisted = true;
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
    })
    .catch(function (err) {
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
  signature = encodeURIComponent(expires);

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
    })
    .catch(function (err) {
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
    })
    .catch(function (err) {
      console.log("Enters in catch!");
      return cb(err)
    });

}

function sslCheck(parsedUrl,cb){
  let isHTTPS = false;
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
      })
      .catch(function (err) {
        cb(err, null)
      });

  }
  else
  {
    isHTTPS = false;
    cb(null, isHTTPS)
  }

}

export function scanURLAndExtractFeatures(url, cb){

  async.auto({
    scarp_page: function(callback) {
      var nightmare = Nightmare({ show: true });
      console.log('it enters');
      nightmare
        .goto(url)
        .wait(1500)
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
            "urlAddressBar": urlAddressBar
          };
        })
        .end()
        .then(function (result) {
         // console.log(result);
          callback(null, result);
        })
        .catch(function (error) {
         // console.error('Search failed:', error);
          callback(error, null);
        });
    },
    unshort_url: function(callback) {
      tall(url)
        .then(function(unshortenedUrl) {
          let urlObject = {};
          urlObject.isShortenedURL = false;
          let originalUrl = url;
          urlObject.originalUrl = originalUrl;
          urlObject.unshortUrl = unshortenedUrl;

          if(originalUrl !== unshortenedUrl)
            urlObject.isShortenedURL = true;

          console.log('Tall url', unshortenedUrl);
          console.log('Original url', originalUrl);
          callback(null, urlObject);
        })
        .catch(function(err) {
          callback(err, null);
        })
      ;
    },
    parse_url: ['unshort_url','scarp_page', function(results, callback) {
      let myUrl = null;
      if(results.scarp_page && results.scarp_page.urlAddressBar )
        myUrl = urlParser.parse(results.scarp_page.urlAddressBar);
      else if (results.unshort_url && results.unshort_url.unshortUrl)
        myUrl = urlParser.parse(results.unshort_url.unshortUrl);
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
    }],
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
    ssl_check: ['parse_url', function(results, callback) {
      sslCheck(results.parse_url, function(err, result){
        if (!err) {
          //console.log(result);
          callback(null, result);
        } else {
          console.log(err);
          callback(err, result);
        }
      })
    }],
    mozscape_api_call: ['parse_url', function(results, callback) {
      mozscapeApiCall(results.parse_url.href, function(err, result){
        if (!err) {
          console.log(result);
          callback(null, result);
        } else {
          //console.log(err);
          callback(err, result);
        }
      })
    }]
  }, function(err, results) {
    if(!err) {
      let scanStatistics = extractValuablePhishingAttributesFromApiResults(results);
      cb(null, scanStatistics)
    }
    else{
      cb(err, "An error has occurred!");
    }

  });
}
