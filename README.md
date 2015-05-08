node-miningcompany
==============
[![Build Status](http://img.shields.io/travis/alexlangberg/node-miningcompany.svg)](https://travis-ci.org/alexlangberg/node-miningcompany)
[![Coverage Status](http://img.shields.io/coveralls/alexlangberg/node-miningcompany.svg)](https://coveralls.io/r/alexlangberg/node-miningcompany?branch=master)
[![Code Climate](http://img.shields.io/codeclimate/github/alexlangberg/node-miningcompany.svg)](https://codeclimate.com/github/alexlangberg/node-miningcompany)
[![npm version](http://img.shields.io/npm/v/miningcompany.svg)](https://www.npmjs.org/package/miningcompany)

[![Gemnasium](http://img.shields.io/gemnasium/alexlangberg/node-miningcompany.svg)](https://gemnasium.com/alexlangberg/node-miningcompany)
[![Dependency Status](https://david-dm.org/alexlangberg/node-miningcompany.svg)](https://david-dm.org/alexlangberg/node-miningcompany)
[![devDependency Status](https://david-dm.org/alexlangberg/node-miningcompany/dev-status.svg)](https://david-dm.org/alexlangberg/node-miningcompany#info=devDependencies)

Miningcompany is a tool for gathering scraping and mining text/links from websites at defined points in time. For instance, imagine you wanted to get all headlines from a news site. Not only that but you want them to be collected automatically each hour - but on weekdays only. You also want their related links and a collection of metadata about the headline. Miningcompany is built for this kind of purpose.

The project is built on several other modules:
- [node-schedule](https://www.npmjs.org/package/node-schedule) - used to schedule when the scraper should run.
- [krawler](https://www.npmjs.org/package/krawler) - the actual scraping is performed by krawler.
- [underscore.string](https://www.npmjs.org/package/underscore.string) - to clean up strings.

Everything is built around mining terminology. This (hopefully) makes it easier to understand what is going on in the module. As such, the most commonly used and important objects are:

- *maps* - an array of JSON objects that each define at minimum a url to scrape and a target (jQuery selector) for goldwasher. Additional parameters (such as filters) for goldwasher can be passed in here.
- *options* - options for miningcompany and krawler.
- *cart* - a collection of results from scraping one of the maps.

1. When you call ```open()``` on an instantiated miningcompany, it will start up a *scheduler*. 
2. Every time the *scheduler* reaches a scheduled point in time, it will fire a new *trip*. 
3. On every *trip*, all the *maps* will be *mined* and for each, a *cart* of results (and eventual errors) will be returned. 
4. Each *cart* contains results with their respective cheerio DOM, that you can use to pick out whatever you need. 
5. What you do from here is up to you, for instance you could easily store it directly with [MongoDB](https://www.npmjs.org/package/mongodb) for later analysis.

As Miningcompany is an EventEmitter, you can listen for all parts of the cycle and catch the carts. See example below or run the included ```example.js``` to see how it works.

## Installation
```
npm install miningcompany
```

## options
- ```schedule``` - a pattern node-schedule will accept. The easiest is to use an object literal as in the example. However, you can also pass in a CRON string if you feel like.
- ```krawler``` - an optional object literal with additional options for krawler. By default, ```forceUTF8``` is set to *true*. 


## Example
```javascript
var Miningcompany = require('./lib/miningcompany.js');

// get headlines from frontpage of reddit
var maps = [
  {
    url: 'http://www.reddit.com',
    targets: 'a.title'
  },
  {
    url: 'http://www.sitethatwillobviouslyfail.com',
    targets: 'h1'
  }
];

// trip every 10 seconds
var options = {
  schedule: {
    second: [0, 10, 20, 30, 40, 50]
  }
};

var company = new Miningcompany(maps, options);

company
  .on('open', function () {
    console.log('open!');
  })
  .on('plan', function () {
    console.log('plan!');
  })
  .on('trip', function () {
    console.log('trip!');
  })
  .on('mine', function () {
    console.log('mine!');
  })
  .on('cart', function (cart) {
    console.log('cart!', cart);
  })
  .on('shut', function () {
    console.log('shut!');
  })
  .open();

// shut down after 35 seconds
setTimeout(function () {
  company.shut();
}, 35000);
```