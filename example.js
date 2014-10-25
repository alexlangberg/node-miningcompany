'use strict';

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
  .on('wash', function () {
    console.log('wash!');
  })
  .on('cart', function (cart) {
    console.log('cart!', cart);
  })
  .on('shut', function () {
    console.log('shut!');
  })
  // remember to open the company to start running
  .open();

// shut down after 35 seconds
setTimeout(function () {
  company.shut();
}, 35000);