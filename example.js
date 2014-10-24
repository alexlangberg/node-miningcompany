'use strict';

var Miningcompany = require('./lib/miningcompany.js');

var maps = [
  {
    url: 'http://www.reddit.com',
    targets: 'a.title'
  }
];

var options = {
  schedule: {
    second: [0, 10, 20, 30, 40, 50]
  }
};

var company = new Miningcompany(maps, options);

company
  .on('trip', function() {
    console.log('trip!');
  })
  .on('mine', function() {
    console.log('mine!');
  })
  .on('wash', function() {
    console.log('wash!');
  })
  .on('cart', function(cart) {
    console.log('cart!', cart);
  });