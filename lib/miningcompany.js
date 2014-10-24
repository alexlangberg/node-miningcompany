'use strict';

var _ = require('underscore');
var util = require('util');
var events = require('events');
var schedule = require('node-schedule');
var Krawler = require('krawler');
var goldwasher = require('goldwasher');

var Miningcompany = function (maps, options) {
  // keep reference to Miningcompany object
  var self = this;

  // input validation
  if (maps === undefined) {
    throw new Error('No maps provided.');
  }

  // input validation
  if (!_.isArray(maps)) {
    if (_.isObject(maps)) {
      maps = [maps];
    }
    else {
      throw new Error('Provided map was not an object.');
    }
  }

  // save maps
  self.maps = maps;

  // create default options object if none is provided
  if (options === undefined) {
    options = {};
  }

  // overwrite default options if options object is provided
  self._options = _({
    schedule: {
      second: 1
    },
    krawler: {
      forceUTF8: true
    },
    goldwasher: true
  }).extend(options);

  // make Miningcompany an EventEmitter
  events.EventEmitter.call(self);
};

// Miningcompany inherits from EventEmitter
util.inherits(Miningcompany, events.EventEmitter);

Miningcompany.prototype.open = function() {
  var self = this;
  self.emit('open');
  // start the schedule
  self.plan(self._options);
};

Miningcompany.prototype.shut = function() {
  var self = this;
  self.emit('shut');
  self._scheduler.cancel();
};

Miningcompany.prototype.plan = function (options) {
  var self = this;
  // start the schedule that will run the trips
  self._scheduler = schedule.scheduleJob(options.schedule, function () {
    self.emit('trip');
    self.mine(self.maps, options);
  });
};

Miningcompany.prototype.mine = function (maps, options) {
  var self = this;
  self.emit('mine');
  var miner = new Krawler(options.krawler);
  // prepare an object for the results
  var cart = {
    started: Date.now(),
    results: [],
    errors: []
  };
  // crawl all maps
  miner.queue(maps)
    .on('data', function ($, map, response) {
      // when map is crawled, add result to results object
      cart.results.push({
        map: map,
        dom: $,
        response: response
      });
    })
    .on('error', function (err, map) {
      // if crawl of map fails, push the error to the results object
      cart.errors.push({
        map: map,
        error: err
      });
    })
    .on('end', function () {
      // when done, add finishing time and return result to callback
      cart.finished = Date.now();
      // if goldwasher is enabled, wash out the gold
      if (options.goldwasher === true) {
        cart = self.wash(cart);
      }
      // return with the cart
      self.emit('cart', cart);
    });
};

Miningcompany.prototype.wash = function (cart) {
  var self = this;
  self.emit('wash');
  // run goldwasher on all items and add result as a property to the item itself
  _(cart.results).map(function (item) {
    item.gold = goldwasher(item.map, item.dom);
  });
  // return the input since map has just added to all objects
  return cart;
};

// export the constructor as the module
module.exports = Miningcompany;