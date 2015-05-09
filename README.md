node-miningcompany
==============
[![Build Status](http://img.shields.io/travis/alexlangberg/node-miningcompany.svg)](https://travis-ci.org/alexlangberg/node-miningcompany)
[![Coverage Status](http://img.shields.io/coveralls/alexlangberg/node-miningcompany.svg)](https://coveralls.io/r/alexlangberg/node-miningcompany?branch=master)
[![Code Climate](http://img.shields.io/codeclimate/github/alexlangberg/node-miningcompany.svg)](https://codeclimate.com/github/alexlangberg/node-miningcompany)
[![npm version](http://img.shields.io/npm/v/miningcompany.svg)](https://www.npmjs.org/package/miningcompany)

[![Gemnasium](http://img.shields.io/gemnasium/alexlangberg/node-miningcompany.svg)](https://gemnasium.com/alexlangberg/node-miningcompany)
[![Dependency Status](https://david-dm.org/alexlangberg/node-miningcompany.svg)](https://david-dm.org/alexlangberg/node-miningcompany)
[![devDependency Status](https://david-dm.org/alexlangberg/node-miningcompany/dev-status.svg)](https://david-dm.org/alexlangberg/node-miningcompany#info=devDependencies)

Note: version 1.0 no longer includes goldwasher. Use the string and validator module to easily replicate this functionality if needed. See advanced example.

Miningcompany is a tool for gathering scraping and mining text/links from websites at defined points in time. For instance, imagine you wanted to get all headlines from a news site. Not only that but you want them to be collected automatically each hour - but on weekdays only. You also want their related links and a collection of metadata about the headline. Miningcompany is built for this kind of purpose and also includes recommended string and validator tools to work with the results. 

The project is built on several other modules:
- [node-schedule](https://www.npmjs.org/package/node-schedule) - used to schedule when the scraper should run.
- [krawler](https://www.npmjs.org/package/krawler) - the actual scraping is performed by krawler.
- [validator](https://www.npmjs.org/package/validator) - to check/validate strings.
- [underscore.string](https://www.npmjs.org/package/underscore.string) - to clean up strings.

Everything is built around mining terminology. This (hopefully) makes it easier to understand what is going on in the module. As such, the most commonly used and important objects are:

- *maps* - an array of JSON objects that each define at minimum a url to scrape. Additional parameters can also be passed in here, for instance targets for later use.
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


## Simple example
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

## Advanced example (included as example.js)
```javascript
var Miningcompany = require('./lib/miningcompany.js');

// get headlines from frontpage of CNN
var maps = [
  {
    url: 'http://www.cnn.com'
  },
  {
    url: 'http://www.sitethatwillobviouslyfail.com'
  }
];

// trip every 10 seconds
var options = {
  schedule: {
    second: [0, 10, 20, 30, 40, 50]
  }
};

var company = new Miningcompany(maps, options);

company.on('open', function() {
  console.log('Miningcompany open!');
})
.on('shut', function() {
  console.log('Miningcompany closed!');
})
.on('cart', function(cart, s, v) {

  // prepare your custom cart
  var finalCart = {
    uuid: cart.uuid,
    start: cart.started,
    finished: cart.finished,
    results: []
  };

  // use validator to check that cart has a valid UUID
  console.log('UUID: ' + v.isUUID(cart.uuid));

  // go through each result, we ignore errors in the cart
  cart.results.forEach(function(result) {
    var finalResult = {
      url: result.map.url,
      headlines: []
    };

    // bind $ to the cheerio instance of this result and find all hits
    var $ = result.dom;
    var hits = $(result.map.targets);

    // go through each hit. Note that "each" is a cheerio function!
    hits.each(function() {

      // get link of each headline
      var href = company.getClosestHref(result.map.url, $(this));

      // get text using cheerio
      var text = $(this).text();

      // clean text using underscore.string
      text = s(text).replaceAll('&nbsp;', ' ')
        .unescapeHTML()
        .stripTags()
        .clean()
        .value();

      finalResult.headlines.push({
        text: text,
        href: href
      });
    });

    finalCart.results.push(finalResult);
  });

  // show cart
  console.log(finalCart);

  // show 3 first headlines of first result of cart
  console.log(finalCart.results[0].headlines[0]);
  console.log(finalCart.results[0].headlines[1]);
  console.log(finalCart.results[0].headlines[2]);
})
.open();

// shut down after 35 seconds
setTimeout(function() {
  company.shut();
}, 35000);
```