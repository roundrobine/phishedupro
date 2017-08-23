'use strict';

const request = require('request');
const cheerio = require('cheerio');
const async = require('async');
const parseDomain = require("parse-domain");
const dns = require('dns');
const tall = require('tall').default;
const urlParser = require('url');
const ipaddr = require('ipaddr.js');
const DOT_CHARACTER = '\\.';
const WWW = "www"
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


export function scanURLAndExtractFeatures(url, cb){

  async.auto({
    parse_url: function(callback) {
      tall(url)
        .then(function(unshortenedUrl) {
          console.log('Tall url', unshortenedUrl);
          let originalUrl = url;
          console.log('Original url', originalUrl);
          let urlObject = {};
          urlObject.originalUrl = originalUrl;
          urlObject.unshortUrl = unshortenedUrl;
          let myUrl = urlParser.parse(unshortenedUrl);
          myUrl.isUrlIPAddress = ipaddr.isValid(myUrl.hostname);
          if(!myUrl.isUrlIPAddress && myUrl.host)
            myUrl.tokenizeHost = parseDomain(url);
          myUrl.urlLenght = unshortenedUrl.length;
          myUrl.atSimbol = unshortenedUrl.indexOf("@") > -1 ? true : false;
          myUrl.prefixSufix = myUrl.hostname.indexOf("-") > -1 ? true : false;
          myUrl.dotsInSubdomainCout = 0;
          myUrl.hasSubdomain = false;
          if(myUrl.tokenizeHost) {
            let filteredSubdomain = removeWWWSubdomainFromURL(myUrl.tokenizeHost.subdomain);
            myUrl.dotsInSubdomainCout = count(filteredSubdomain, DOT_CHARACTER);
            if(filteredSubdomain)
              myUrl.hasSubdomain = true;
          }

          dns.lookup(myUrl.hostname, function (err, address, family) {
            myUrl.ipAddress = address;
            myUrl.ipFamily = family;
            urlObject.parsedUrl = myUrl;
            console.log(urlObject);
            callback(null, urlObject);
          });

        })
        .catch(function(err) {
          callback(err, null);
        })
      ;

    },
    scarp_page: function(callback) {
      var nightmare = Nightmare({ show: true });
      console.log('it enters');
      nightmare
        .goto(url)
        .wait(2000)
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
/*      request(url, function(err, resp, body){
        var $ = cheerio.load(body);
        var anchors  = $('a'); //jquery get all hyperlinks
        var imgs = $('img');
        var embeds = $('embed');
        var videos = $('video');
        var audios = $('audio');
        var iframes = $('iframe');
        var sources = $('source');
        var scripts = $('script');
        var links = $('link');
        var bases = $('base');
        var forms = $('form');
        var passwordFields = $('input[type="password"]');

        $(imgs).each(function(i, img){
          console.log("image " + i + " :", $(img).attr('src'));
        });

        $(videos).each(function(i, video){
          console.log("video " + i + " :", $(video).attr('src'));
        });

        $(audios).each(function(i, audio){
          console.log("audio " + i + " :", $(audio).attr('src'));
        });

        $(iframes).each(function(i, iframe){
          console.log("iframe " + i + " :", $(iframe).attr('src'));
        });

        $(sources).each(function(i, source){
          console.log("source " + i + " :", $(source).attr('src'));
        });

        $(embeds).each(function(i, embed){
          console.log("embed " + i + " :", $(embed).attr('src'));
        });

        $(scripts).each(function(i, script){
          console.log("script " + i + " :", $(script).attr('src'));
        });

        $(links).each(function(i, link){
          console.log("link " + i + " :", $(link).attr('href'));
        });

        $(bases).each(function(i, base){
          console.log("base " + i + " :", $(base).attr('href'));
        });

        $(forms).each(function(i, form){
          console.log("form " + i + " :", $(form).attr('action'));
        });

        $(passwordFields).each(function(i, password){
          console.log("password " + i + " :", $(password).attr('name'));
        });

        var linksArray = [];
        $(anchors).each(function(i, anchor){
          //console.log($(link).text() + ':\n  ' + $(link).attr('href'));
          linksArray.push($(anchor).attr('href'));
        });

        callback(null, linksArray);
      });*/
    },
    dns_lookup: ['parse_url','scarp_page', function(results, callback) {
      let myUrl = null;
      if(results.scarp_page && results.parse_url && results.scarp_page.urlAddressBar && results.parse_url.unshortUrl
        && results.scarp_page.urlAddressBar !== results.parse_url.unshortUrl) {
        myUrl = urlParser.parse(results.scarp_page.urlAddressBar);
        myUrl.isUrlIPAddress = ipaddr.isValid(myUrl.hostname);
        if (!myUrl.isUrlIPAddress && myUrl.host)
          myUrl.tokenizeHost = parseDomain(results.scarp_page.urlAddressBar);
        myUrl.urlLenght = results.scarp_page.urlAddressBar.length;
        myUrl.atSimbol = results.scarp_page.urlAddressBar.indexOf("@") > -1 ? true : false;
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
      }
      else {
        console.log("Enters the else condition!")
        callback(null, myUrl);
      }
    }],
   /* write_file: ['get_data', 'make_folder', function(results, callback) {
      console.log('in write_file', JSON.stringify(results));
      // once there is some data and the directory exists,
      // write the data to a file in the directory
      callback(null, 'filename');
    }],
    email_link: ['write_file', function(results, callback) {
      console.log('in email_link', JSON.stringify(results));
      // once the file is written let's email a link to it...
      // results.write_file contains the filename returned by write_file.
      callback(null, {'file':results.write_file, 'email':'user@example.com'});
    }]*/
  }, function(err, results) {
   // console.log('err = ', err);
    //console.log('results = ', results.scarp_page);
    cb(err, results.scarp_page);
  });
}

/*
module.exports = {
  getWeather: getWeather,
  buildFormatedResponse: buildFormatedResponse,
  getDailyForecastApiLink: getDailyForecastApiLink,
  getUnitofMeasurement: getUnitofMeasurement,
  getWeatherIconMapping: getWeatherIconMapping,
  removeUnusedValuesFromDailyForecast: removeUnusedValuesFromDailyForecast,
  buildFormatedResponseCurrentDay: buildFormatedResponseCurrentDay
};
*/
