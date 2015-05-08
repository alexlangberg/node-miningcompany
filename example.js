'use strict';

var Miningcompany = require('./lib/miningcompany.js');

// get headlines from frontpage of reddit
var maps = [
  {
    url: 'http://www.cnn.com',
    targets: 'h3'
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

company.on('open', function() {
  console.log('Miningcompany open!');
})
.on('shut', function() {
  console.log('Miningcompany closed!');
})
.on('cart', function(cart, s) {

  // prepare your custom cart
  var finalCart = {
    uuid: cart.uuid,
    start: cart.started,
    finished: cart.finished,
    results: []
  };

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

      // get text using cheerio
      var text = $(this).text();

      // clean text using underscore.string
      text = s(text).replaceAll('&nbsp;', ' ')
        .unescapeHTML()
        .stripTags()
        .clean()
        .value();

      finalResult.headlines.push(text);
    });

    finalCart.results.push(finalResult);
  });

  // show results!
  console.log(finalCart, finalCart.results);
})
.open();

// shut down after 35 seconds
setTimeout(function() {
  company.shut();
}, 35000);