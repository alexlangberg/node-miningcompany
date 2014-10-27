node-miningcompany
==============
[![Build Status](http://img.shields.io/travis/alexlangberg/node-miningcompany.svg)](https://travis-ci.org/alexlangberg/node-miningcompany)
[![Coverage Status](http://img.shields.io/coveralls/alexlangberg/node-miningcompany.svg)](https://coveralls.io/r/alexlangberg/node-miningcompany?branch=master)
[![Code Climate](http://img.shields.io/codeclimate/github/alexlangberg/node-miningcompany.svg)](https://codeclimate.com/github/alexlangberg/node-miningcompany)
[![npm version](http://img.shields.io/npm/v/miningcompany.svg)](https://www.npmjs.org/package/miningcompany)

[![Gemnasium](http://img.shields.io/gemnasium/alexlangberg/node-miningcompany.svg)](https://gemnasium.com/alexlangberg/node-miningcompany)
[![Dependency Status](https://david-dm.org/alexlangberg/node-miningcompany.svg)](https://david-dm.org/alexlangberg/node-miningcompany)
[![devDependency Status](https://david-dm.org/alexlangberg/node-miningcompany/dev-status.svg)](https://david-dm.org/alexlangberg/node-miningcompany#info=devDependencies)

Miningcompany is a tool for gathering scraping and mining text from websites at defined intervals. For instance, imagine you wanted to get all headlines from a news site. Not only that but you want them to be collected automatically each hour - but on weekdays only. You also want their related links and a collection of metadata about the headline. Miningcompany is built for this kind of purpose.

The project is built on several other modules:
1. [node-schedule](https://www.npmjs.org/package/node-schedule) - used to schedule when the scraper should run.
2. [krawler](https://www.npmjs.org/package/krawler) - the actual scraping is performed by krawler.
3. [goldwasher](https://www.npmjs.org/package/goldwasher) - goldwasher can optionally be used to extract links and meta data.

Everything is built around real mining terminology to give the different functionalities a more comprehensible semantic meanings. This makes it easier to understand what is going on in the module. As such, the most commonly used and important objects are:

- *maps* - an array of JSON objects that each define at minimum a url to scrape and a target (jQuery selector)
- *cart* - a collection of results from scraping one of the maps.
- *gold* - if you choose to enable goldwasher, every cart will have an array of goldwasher results added as a property with this name.
- *options* - options for miningcompany, krawler and goldwasher.

When you call ```open()``` on the instantiated miningcompany, it will start up a *scheduler*. Every time the *scheduler* reaches a scheduled point in time, it will fire a new *trip*. On every *trip*, all the *maps* will be *mined* and for each, a *cart* of results will be returned. Each *cart* is full of *gold* (and also contains the DOM if you want to target something manually). What you do from here is up to you, for instance you could easily store it directly with MongoDB for later analysis.

As Miningcompany is also an EventEmitter, you can listen for all parts of the cycle and catch the carts. See example below or run the included ```example.js``` to see how it works.

## Installation
```
npm install miningcompany
```

## options
```
- ```targets``` - jquery/cheerio selection of target tags.
```

## Example
```javascript

```