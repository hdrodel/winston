/*
 * loggly.js: Transport for logginh to remote Loggly API
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 *
 */

var loggly = require('loggly'),
    utils = require('./../utils'); 

//
// function Loggly (options)
//   Constructor for the Loggly transport object.
//
var Loggly = exports.Loggly = function (options) {
  options = options || {};
  if (!options.auth)       throw new Error('Loggly authentication is required');
  if (!options.subdomain)  throw new Error('Loggly Subdomain is required');
  if (!options.inputToken && !options.inputName) throw new Error('Target input token or name is required.');
  
  this.name = 'loggly'; 
  this.client = loggly.createClient({
    subdomain: options.subdomain,
    auth: options.auth
  });
  
  if (options.inputToken) {
    this.inputToken = options.inputToken;
    this.ready = true;
  }
  else if (options.inputName) {
    this.ready = false;
    this.inputName = options.inputName;
    
    var self = this;
    this.client.getInput(this.inputName, function (err, input) {
      if (err) throw err;
      
      self.inputToken = input.input_token;
      self.ready = true;
    });
  }
};

//
// function log (level, msg, [meta], callback)
//   Core logging method exposed to Winston. Metadata is optional.
//
Loggly.prototype.log = function (level, msg, meta, callback) {
  var message = utils.clone(meta);
  message.level = level;
  message.message = msg;
  
  // TODO: Fix Race condition here if 'inputName' is provided to the constructor
  this.client.log(this.inputToken, message, callback);
};