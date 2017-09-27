'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var RuleSchema = new mongoose.Schema({
  name: {
    type:String,
    required : true,
    trim: true,
    maxlength: 150
  },
  description: {
    type:String,
    required : true,
    trim: true
  },
  code:{
    type:String,
    required : true,
    trim: true,
    maxlength: 9,
    unique: true
  },
  weight:{
    type:Number,
    min: 0,
    max: 1,
    required : true
  },
  active: {
    type:Boolean,
    default: true,
  }
});

export default mongoose.model('Rule', RuleSchema);
