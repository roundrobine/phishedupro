'use strict';

const request = require('request');
const cheerio = require('cheerio');
const async = require('async');
const url = require('url');
const parseDomain = require("parse-domain");

//count('Yes. I want. to. place a. lot of. dots.','\\.'); //=> 6
function count(url, character) {
  return ( url.match( RegExp(character,'g') ) || [] ).length;
}

const DOT_CHARACTER = "\\.";


export function scanURLAndExtractFeatures(url, cb){

  async.auto({
    scarp_page: function(callback) {
      request(url, function(err, resp, body){
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
      });
    },
    /*parse_ugrl: function(callback) {
      console.log('in make_folder');
      // async code to create a directory to store a file in
      // this is run at the same time as getting the data
      callback(null, 'folder');
    },
    write_file: ['get_data', 'make_folder', function(results, callback) {
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
    console.log('err = ', err);
    console.log('results = ', results.scarp_page);
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
