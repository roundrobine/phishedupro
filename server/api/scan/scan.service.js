'use strict';
import config from '../../config/environment';
const async = require('async');
const parseDomain = require("parse-domain");
const dns = require('dns');
const tall = require('tall').default;
const urlParser = require('url');
const ipaddr = require('ipaddr.js');
const alexa = require('alexarank');
const DOT_CHARACTER = '\\.';
const WWW = "www"
const rp = require('request-promise');
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

function myWOT(url,cb){

  var options = {
    uri: config.api_endpoints.my_wot,
    qs: {
      hosts: url,
      key: config.secrets.my_wot.key // -> uri + '?hosts=xxxxx%20xxxxx'
    },
    headers: {
      'User-Agent': 'Request-Promise'
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

function whoisLookup(url,cb){

  var options = {
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
          let scriptArray = [];
          let linkArray = [];
          let formArray = [];
          let iFrameArray = [];
          let inputTextArray = [];

          let linkArrayTemp = document.querySelectorAll("link");
          for (let i=0;i<linkArrayTemp.length;i++) {
            if (linkArrayTemp[i].href)
              linkArray.push(linkArrayTemp[i].href);
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

          let scriptArrayTemp = document.querySelectorAll("script");
          for (let i=0;i<scriptArrayTemp.length;i++) {
            if (scriptArrayTemp[i].src)
              scriptArray.push(scriptArrayTemp[i].src);
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
            "scriptArray": scriptArray,
            "linkArray": linkArray,
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
          callback(null, myUrl);
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
    whois_lookup: ['parse_url', function(results, callback) {

      let domain = results.parse_url.tokenizeHost.domain + "." + results.parse_url.tokenizeHost.tld;
      whoisLookup(domain, function(err, result){
        if (!err) {
          console.log(result.created_on);
          callback(null, result);
        } else {
          console.log(err);
          callback(err, result);
        }
      })
    }]
  }, function(err, results) {
   // console.log('err = ', err);
    //console.log('results = ', results.scarp_page);
    cb(err, results.scarp_page);
  });
}
