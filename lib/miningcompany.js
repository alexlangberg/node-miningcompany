'use strict';

var krawler = require('krawler');
var goldwasher = require('goldwasher');
var _ = require('underscore');

var fetchUrls = function (destinations, options, callback) {
  var crawler = new krawler(options);
  var result = {
    started: Date.now(),
    results: [],
    errors: []
  };

  crawler.queue(destinations)
    .on('data', function ($, destination, response) {
      result.results.push({
        destination: destination,
        dom: $,
        response: response
      });
    })
    .on('error', function (err, destination) {
      result.errors.push({
        destination: destination,
        error: err
      });
    })
    .on('end', function () {
      result.finished = Date.now();
      return callback(result);
    });
};

var parseUrls = function (input, options) {
  _(input.results).map(function (item) {
    item.nuggets = goldwasher(item.destination, item.dom);
  });
  return input;
};

var miningcompany = function (destinations, options, callback) {
  fetchUrls(destinations, options, function (result) {
    var parsed = parseUrls(result, options);
    return callback(parsed);
  });
};

module.exports = miningcompany;