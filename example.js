'use strict';

var Miningcompany = require('./lib/miningcompany.js');

// get headlines from frontpage of cnn
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