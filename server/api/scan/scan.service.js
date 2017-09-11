'use strict';
import config from '../../config/environment';
const MY_WOT = require('./scan.config').MY_WOT;
const async = require('async');
const parseDomain = require("parse-domain");
const dns = require('dns');
const tall = require('tall').default;
const urlParser = require('url');
const ipaddr = require('ipaddr.js');
const alexa = require('alexarank');
const rp = require('request-promise');
const crypto = require('crypto');
const DOT_CHARACTER = '\\.';
const WWW = "www"
const HTTPS = 'https:';
const TRUSTWORTHINESS = "0";
const CHILD_SAFETY = "4";

var Nightmare = require('nightmare');

var AUDIO = "audio";
var VIDEO = "video";
var IMG = "img";
var ANCHOR = "a";
var SCRIPT = "script";
var LINK = "link";
var EMBED = "embed";
var SOURCE = "source";


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


function extractValuablePhishingAttributesFromApiResults(results, cb){

    let scanModel = {};

    if(results){
      if(results.scarp_page){
        scanModel.crawlerResults = results.scarp_page;
      }
      if(results.unshort_url){
        scanModel.unshortUrl = results.unshort_url;
      }
      if(results.parse_url){
        scanModel.parsedUrl = results.parse_url;
      }
      if(results.alexa_ranking){
        scanModel.alexa = {};
        if(results.alexa_ranking.rank) {
          scanModel.alexa.rank = results.alexa_ranking.rank;
          scanModel.alexa.isRanked = true;
        }
        else{
          scanModel.alexa.isRanked = false;
        }
      }
      if(results.my_wot_reputation && results.parse_url){
        let hostName = results.parse_url.hostname;
        scanModel.myWOT = {
          hasWOTStatistics: false,
          isBlacklisted: false
        };
        if (results.my_wot_reputation[hostName]){
          if(results.my_wot_reputation[hostName][MY_WOT.TRUSTWORTHINESS]) {
            scanModel.myWOT.trustworthiness = results.my_wot_reputation[hostName][MY_WOT.TRUSTWORTHINESS];
            scanModel.myWOT.hasWOTStatistics = true;
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
                  console.log(prop + " -> " + categories[prop]);
                  category.description = switchMyWOTCategories(prop);
                  category.code = prop;
                  category.value = categories[prop];
                  scanModel.myWOT.categories.push(category);
                }
              }
          }
          if(results.my_wot_reputation[hostName][MY_WOT.BLACKLISTS]){
            scanModel.myWOT.hasWOTStatistics = true;
            scanModel.isBlacklisted = true;
            let blacklists = results.my_wot_reputation[hostName][MY_WOT.BLACKLISTS];
            scanModel.myWOT.blacklists = {};
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
      cb(null, scanModel);
    }
    else{
      cb(new Error("Result object is null!"), null);
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
    resolveWithFullResponse: true,
    json: true // Automatically parses the JSON string in the response
  };

  rp(options)
    .then(function (res) {
      if (res.statusCode !== 200) {
        console.log('Request failed: ' + res.statusCode);
        cb(err, null)
      }
      else {
        cb(null, res.body)
      }
    })
    .catch(function (err) {
      cb(err, null)
    });

}

function sslCheck(parsedUrl,cb){
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
    let isHTTPS = {};
    isHTTPS.text = 'This website is using HTTP protocol';
    isHTTPS.value = -1;
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
        .wait(2000)
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


          let inputTextArrayTemp = document.querySelectorAll("input[type='password'], input[type='text'], input[type='email']");
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
        if (!myUrl.isUrlIPAddress && myUrl.host)
          myUrl.tokenizeHost = parseDomain(myUrl.href);
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
          callback(err, result);
        }
      });
    }],
    my_wot_reputation: ['parse_url', function(results, callback) {
      myWOT(results.parse_url.href, function(err, result){
        if (!err) {
          console.log(result);
          callback(null, result);
        } else {
          console.log(err);
          callback(err, result);
        }
      })
    }],
   /* whois_lookup: ['parse_url', function(results, callback) {
      //let domain = results.parse_url.tokenizeHost.domain + "." + results.parse_url.tokenizeHost.tld;
      whoisXmlApi(results.parse_url.hostname, function(err, result){
        if (!err) {
          console.log(result);
          callback(null, result);
        } else {
          console.log(err);
          callback(err, result);
        }
      })
    }],*/
   /* ssl_check: ['parse_url', function(results, callback) {
      sslCheck(results.parse_url, function(err, result){
        if (!err) {
          console.log(result);
          callback(null, result);
        } else {
          console.log(err);
          callback(err, result);
        }
      })
    }],*/
   /* mozscape_api_call: ['parse_url', function(results, callback) {
      //let domain = results.parse_url.tokenizeHost.domain + "." + results.parse_url.tokenizeHost.tld;
      mozscapeApiCall(results.parse_url.href, function(err, result){
        if (!err) {
          console.log(result);
          callback(null, result);
        } else {
          //console.log(err);
          callback(err, result);
        }
      })
    }]*/
  }, function(err, results) {
    extractValuablePhishingAttributesFromApiResults(results, function(error, res){
      if(!err)
        cb(null, res);
      else
        cb(err, res);
    })

  });
}
