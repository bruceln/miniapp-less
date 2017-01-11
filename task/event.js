var util = require('util');
var emitter;
var EventEmitter = require('events');

function MyEmitter() {
  EventEmitter.call(this)
}

util.inherits(MyEmitter, EventEmitter);

emitter = new MyEmitter;

module.exports = emitter;