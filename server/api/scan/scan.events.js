/**
 * Scan model events
 */

'use strict';

import {EventEmitter} from 'events';
var Scan = require('./scan.model');
var ScanEvents = new EventEmitter();


// Set max event listeners (0 == unlimited)
ScanEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Scan.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    ScanEvents.emit(event + ':' + doc._id, doc);
    ScanEvents.emit(event, doc);
  }
}

export default ScanEvents;
