'use strict';

var util = require('util');
var events = require('events');
var schedule = require('node-schedule');
var Krawler = require('krawler');
var R = require('ramda');

/**
 * Constructor for a mining company.
 * Module should be instantiated with "new Miningcompany(maps, options)"
 * @param {object|object[]} maps
 * @param {object=} options
 * @constructor
 */
var Miningcompany = function(maps, options) {
  // keep reference to Miningcompany object
  var _this = this;

  // input validation
  if (maps === undefined) {
    throw new Error('No maps provided.');
  }

  // input validation
  if (!R.isArrayLike(maps)) {
    if (R.is(Object, maps)) {
      maps = [maps];
    }
    else {
      throw new Error('Provided map was not an array or an object.');
    }
  }

  // save maps
  _this.maps = maps;

  // create default options object if none is provided
  if (options === undefined) {
    options = {};
  }

  // input validation
  if (!R.is(Object, options)) {
    throw new Error('Options parameter must be an object.');
  }

  // overwrite default options if options object is provided
  _this._options = R.merge({
    schedule: {
      minute: 1
    },
    krawler: {
      forceUTF8: true
    }
  }, options);

  // make Miningcompany an EventEmitter
  events.EventEmitter.call(_this);
};

// Miningcompany inherits from EventEmitter
util.inherits(Miningcompany, events.EventEmitter);

/**
 * Opens the mining company.
 * Will set up the scheduler.
 */
Miningcompany.prototype.open = function() {
  var _this = this;
  _this.emit('open');

  // start the schedule
  _this.plan(_this._options);
};

/**
 * Sets up the scheduler.
 * Will call "mine" according to provided schedule.
 * @param {object} options
 */
Miningcompany.prototype.plan = function(options) {
  var _this = this;
  _this.emit('plan');

  // start the schedule that will run the trips
  _this._scheduler = schedule.scheduleJob(options.schedule, function() {
    var miner;
    _this.emit('trip');
    miner = new Krawler(options.krawler);
    _this.mine(miner, _this.maps);
  });
};

/**
 * Starts the miner.
 * Will emit a cart object for each mined url.
 * @param {Krawler} miner - An instance of node-krawler.
 * @param {(object|object[])} maps
 */
Miningcompany.prototype.mine = function(miner, maps) {
  var _this = this;
  _this.emit('mine');

  // prepare an object for the results
  var cart = {
    started: Date.now(),
    results: [],
    errors: []
  };

  // crawl all maps
  miner
    .on('data', function($, map, response) {
      // when map is crawled, add result to results object
      cart.results.push({
        map: map,
        dom: $,
        response: response
      });
    })
    .on('error', function(err, map) {
      // if crawl of map fails, push the error to the results object
      cart.errors.push({
        map: map,
        error: err
      });
    })
    .on('end', function() {
      // when done, add finishing time and return result to callback
      cart.finished = Date.now();

      // return with the cart
      _this.emit('cart', cart);
    });

  miner.queue(maps);
};

/**
 * Shuts down the company. It will no longer mine.
 * It can, however, be opened again with open().
 */
Miningcompany.prototype.shut = function() {
  var _this = this;
  _this.emit('shut');
  _this._scheduler.cancel();
};

// export the constructor as the module
module.exports = Miningcompany;
