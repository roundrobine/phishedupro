'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if (!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server port
  port: process.env.PORT || 9000,

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  // Should we populate the DB with sample data?
  seedDB: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'phishedupro-secret',
    moz:{
      accessId: "mozscape-6d65275f91",
      secretKey: "7945e0f265ab68e5f64c75fdc2a89024"
    },
    my_wot:{
      key: "81be2449b4591061dca0500f83eb22279edff965"
    },
    whois_api:{
      token: "c91c162c070db8939cdaae76cb4b6b35"
    }
  },

  api_endpoints:{
    my_wot: "http://api.mywot.com/0.4/public_link_json2",
    whois_lookup: "https://jsonwhois.com/api/v1/whois"
  },

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  }
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./shared'),
  require('./' + process.env.NODE_ENV + '.js') || {});
