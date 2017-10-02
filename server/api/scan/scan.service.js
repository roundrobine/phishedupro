'use strict';
import config from '../../config/environment';
import Rule from '../rule/rule.model';
import _ from 'lodash';
const MY_WOT = require('./scan.config').MY_WOT;
const MOZCAPE = require('./scan.config').MOZCAPE;
const TOP_PHISHING_DOMAINS = require('./scan.config').TOP_PHISHING_DOMAINS;
const TOP_PHISHING_IP_ADDRESSES = require('./scan.config').TOP_PHISHING_IP_ADDRESSES;
const TOP_PHISHING_KEYWORDS = require('./scan.config').TOP_PHISHING_KEYWORDS;
const WHITELISTED_DOMAINS = require('./scan.config').WHITELISTED_DOMAINS;
const PHISHING_CLASS = require('./scan.config').PHISHING_CLASS;
const RULE_CODES = require('./scan.config').RULE_CODES;

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


export function generatePhishingFeatureSet(scanStatistics, cb){
  Rule.findAsync()
    .then(function(rules){
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
                if(scanStatistics[rules[i].code].count < rules[i].phishing){
                  scanStatistics[rules[i].code].value = PHISHING_CLASS.phishing;
                  urlScore = urlScore + rules[i].weight;
                }
                else if (scanStatistics[rules[i].code].count >= rules[i].phishing && scanStatistics[rules[i].code].count < rules[i].suspicious){
                  scanStatistics[rules[i].code].value = PHISHING_CLASS.suspicious;
                  urlScore = urlScore + (rules[i].weight / 2);
                }
                else{
                  scanStatistics[rules[i].code].value = PHISHING_CLASS.legitimate;
                }
              }
              break;
          /*  case RULE_CODES.domainRegistrationLength:
              if(scanStatistics.domainRegistrationLength && scanStatistics.domainRegistrationLength.days){
                if(scanStatistics.domainRegistrationLength.days >=  rules[i].phishing){
                  scanStatistics.domainRegistrationLength.value = PHISHING_CLASS.legitimate;
                }
                else{
                  scanStatistics.domainRegistrationLength.value = PHISHING_CLASS.phishing;
                  total = total + rules[i].weight;
                }
              }
              break;*/
            case RULE_CODES.ssl:
              if(scanStatistics.ssl){
                if(scanStatistics.ssl.value === PHISHING_CLASS.phishing){
                  urlScore = urlScore + rules[i].weight;
                }
                else if (scanStatistics.ssl.isTrusted && scanStatistics.ssl.duration >= rules[i].phishing && scanStatistics.ssl.expiresIn > -1
                && scanStatistics.ssl.completeCertChain){
                  scanStatistics.ssl.value = PHISHING_CLASS.legitimate;
                }
                else if(!scanStatistics.ssl.isTrusted && scanStatistics.ssl.duration >= rules[i].phishing && scanStatistics.ssl.expiresIn > -1){
                  scanStatistics.ssl.value = PHISHING_CLASS.suspicious;
                  urlScore = urlScore + (rules[i].weight /2);
                }
                else{
                  scanStatistics.ssl.value = PHISHING_CLASS.phishing;
                  urlScore = urlScore + (rules[i].weight);
                }
              }
              break;
           /* case RULE_CODES.IFR:
              if(scanStatistics.iframe){
                if(scanStatistics.iframe.value ===  PHISHING_CLASS.phishing){
                  total = total + rules[i].weight;
                }
              }
              break;*/
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
                else if (scanStatistics.websiteTrafficAlexa.rank > rules[i].suspicious){
                  scanStatistics.websiteTrafficAlexa.value = PHISHING_CLASS.suspicious;
                  urlScore = urlScore + (rules[i].weight / 2);
                }
                else{
                  scanStatistics.websiteTrafficAlexa.value = PHISHING_CLASS.legitimate;
                }
              }
              break;
           /* case RULE_CODES.PA:
              if(scanStatistics.pageAuthority && scanStatistics.pageAuthority.count){
                if(scanStatistics.pageAuthority.count <= rules[i].phishing){
                  scanStatistics.pageAuthority.value = PHISHING_CLASS.phishing;
                  total = total + rules[i].weight;
                }
                else if (scanStatistics.pageAuthority.count > rules[i].phishing && scanStatistics.pageAuthority.count <= rules[i].suspicious){
                  scanStatistics.pageAuthority.value = PHISHING_CLASS.suspicious;
                  total = total + (rules[i].weight / 2);
                }
                else{
                  scanStatistics.pageAuthority.value = PHISHING_CLASS.legitimate;
                }
              }
              break;*/

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
                if(scanStatistics.ssl &&  scanStatistics.ssl.value === PHISHING_CLASS.phishing){

                  if(scanStatistics.inputFields.numOfPasswordFields > 0){
                    scanStatistics.inputFields.value = PHISHING_CLASS.phishing;
                    urlScore = urlScore + rules[i].weight;
                  }
                  if(scanStatistics.inputFields.numOfTextFields > 0 && scanStatistics.inputFields.numOfPasswordFields === 0){
                    scanStatistics.inputFields.value = PHISHING_CLASS.suspicious;
                    urlScore = urlScore + (rules[i].weight/2);
                  }
                  else{
                    scanStatistics.inputFields.value = PHISHING_CLASS.legitimate;
                  }

                }
                else if (scanStatistics.ssl.isTrusted && scanStatistics.ssl.duration >= rules[i].phishing && scanStatistics.ssl.expiresIn > -1
                  && scanStatistics.ssl.completeCertChain){
                  scanStatistics.inputFields.value = PHISHING_CLASS.legitimate;
                }
                else if(!scanStatistics.ssl.isTrusted && scanStatistics.ssl.duration >= rules[i].phishing && scanStatistics.ssl.expiresIn > -1){
                  if(scanStatistics.inputFields.numOfTextFields > 0 || scanStatistics.inputFields.numOfPasswordFields > 0) {
                    scanStatistics.inputFields.value = PHISHING_CLASS.suspicious;
                    urlScore = urlScore + (rules[i].weight /2);
                  }

                }
                else{
                  if(scanStatistics.inputFields.numOfPasswordFields > 0){
                    scanStatistics.inputFields.value = PHISHING_CLASS.phishing;
                    urlScore = urlScore + rules[i].weight;
                  }
                  if(scanStatistics.inputFields.numOfTextFields > 0 && scanStatistics.inputFields.numOfPasswordFields === 0){
                    scanStatistics.inputFields.value = PHISHING_CLASS.suspicious;
                    urlScore = urlScore + (rules[i].weight/2);
                  }
                  else{
                    scanStatistics.inputFields.value = PHISHING_CLASS.legitimate;
                  }
                }
              }
              break;

          }
      }
      scanStatistics.urlScore = urlScore;
      scanStatistics.totalRulesScore = totalRulesScore;
      scanStatistics.finalScore = calculatePercentage(totalRulesScore, urlScore);
      cb(null,rules);
    },function(err){
      cb(err, null);
    })
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

  if(!parsedUrl.isUrlIPAddress) {
    baseHostNoSubdomain = parsedUrl.tokenizeHost.domain + "." + parsedUrl.tokenizeHost.tld;
  }

  anchorArray.forEach(function(url){
    newHostNoSubdomain = null;
    nextUrl = urlParser.parse(url);

    if(nextUrl && nextUrl.hostname) {
      nextUrl.isUrlIPAddress = ipaddr.isValid(nextUrl.hostname);
    }

    if(nextUrl && nextUrl.href && (validUrl.isHttpUri(nextUrl.href) || validUrl.isHttpsUri(nextUrl.href))) {
      if (!nextUrl.isUrlIPAddress && nextUrl.hostname) {
        nextUrl.tokenizeHost = parseDomain(nextUrl.hostname);
        newHostNoSubdomain = nextUrl.tokenizeHost.domain + "." + nextUrl.tokenizeHost.tld;
      }

      if (nextUrl.hostname && parsedUrl.hostname && nextUrl.hostname === parsedUrl.hostname) {

        if (nextUrl.pathname === parsedUrl.pathname) {
          invalidLinks = invalidLinks + 1;
          urlOfAnchor.invalidLinksArray.push(nextUrl.href);
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
      scanModel.statistics = {};
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
        scanModel.crawlerResults.requestUrlsStats = urlOfAnchorStatistics(results.scrap_page.reqURLArray, results.parse_url);
        scanModel.statistics.requestUrls.percentage = scanModel.crawlerResults.requestUrlsStats.percentage;
        scanModel.crawlerResults.linksInTagsStats = urlOfAnchorStatistics(results.scrap_page.linksInTags, results.parse_url);
        scanModel.statistics.linksInTags.percentage = scanModel.crawlerResults.linksInTagsStats.percentage;
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

        if(results.parse_url.hostname){

          targetWithPath = results.parse_url.hostname;

          if(results.parse_url.tokenizeHost){
            target = results.parse_url.tokenizeHost.domain + "." + results.parse_url.tokenizeHost.tld;
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

          scanModel.urlStatisitcs.whitelistedDomain = _.some(WHITELISTED_DOMAINS, function (urlWhitelisted) {
            return urlWhitelisted === target
          });

          if(results.parse_url.ipAddress) {
            scanModel.urlStatisitcs.topPhishingIP = _.some(TOP_PHISHING_IP_ADDRESSES, function (ip) {
              return ip === results.parse_url.ipAddress
            });
          }

          if(scanModel.urlStatisitcs.topPhishingDomain){
            scanModel.urlStatisitcs.topPhishingDomainValue = target;
          }

          if(scanModel.urlStatisitcs.topPhishingIP){
            scanModel.urlStatisitcs.topPhishingIPValue = target;
          }

          if(scanModel.urlStatisitcs.whitelistedDomain){
            scanModel.urlStatisitcs.whitelistedDomainValue = target;
          }

          if(scanModel.urlStatisitcs.topPhishingIP || scanModel.urlStatisitcs.topPhishingDomain || scanModel.urlStatisitcs.topPhishingKeyword){
            scanModel.statistics.keywordDomainReport.value = PHISHING_CLASS.phishing;
          }
          if(scanModel.urlStatisitcs.whitelistedDomain){
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

        if (scanModel.whoisRecord.createdDate && scanModel.whoisRecord.expiresDate) {
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

        if(scanModel.whoisRecord.domainAgeDays) {
          scanModel.statistics.ageOfDomain.days = scanModel.whoisRecord.domainAgeDays;
        }
        if(scanModel.whoisRecord.expiresInDays) {
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
        scanModel.statistics.isBlacklisted = false;
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

export function scanURLAndExtractFeatures(url, cb){

  async.auto({
    get_final_url: function(callback){
      var nightmareUrl = Nightmare({ show: false });
      nightmareUrl
        .goto(url)
        /*.wait(300)*/
        .evaluate(function () {
          let urlAddressBar = window.location.href;
          return {
            "finalUrl": urlAddressBar
          };
        })
        .end()
        .then(function (result) {
           console.log(result);
          callback(null, result);
        }, function (error) {
          console.error('Search failed:', error);
          callback(error, null);
        });

    },
    scrap_page: function(callback) {
      var nightmare = Nightmare({ show: true });
      console.log('it enters');
      nightmare
        .goto(url)
        .wait(1090)
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
    },
    unshort_url: function(callback) {
      tall(url)
        .then(function(unshortenedUrl) {
          let urlObject = {};
          urlObject.isShortenedURL = false;
          let originalUrl = url;
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
        })
        .catch(function(err) {
          callback(err, null);
        })
      ;
    },
    parse_url: ['unshort_url','get_final_url', function(results, callback) {
      let myUrl = null;
      if(results.get_final_url && results.get_final_url.finalUrl && (validUrl.isHttpUri(results.get_final_url.finalUrl) || validUrl.isHttpsUri(results.get_final_url.finalUrl)))
        myUrl = urlParser.parse(results.get_final_url.finalUrl);
      else if (results.unshort_url && results.unshort_url.unshortUrl && (validUrl.isHttpUri(results.unshort_url.unshortUrl) || validUrl.isHttpsUri(results.unshort_url.unshortUrl)))
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
          console.log(err);
          callback(err, result);
        }
      })
    }]
  }, function(err, results) {
    if(!err) {
      try {
        let scanStatistics = extractValuablePhishingAttributesFromApiResults(results);
        return cb(null, scanStatistics);
      } catch (error) {
        return cb(error, "Error in the function!")
      }
    }
    else{
      return cb(err, "An error has occurred!");
    }

  });
}
