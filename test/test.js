'use strict';

/* exported should */
var chai = require('chai');
    chai.use(require('chai-things'));
var should = chai.should();
var miningcompany = require('../lib/miningcompany.js');

describe('miningcompany', function() {
  this.timeout(10000);
  it('it can fetch an url', function(done){
    var destinations = [
      {
        url: 'http://www.pol.dk',
        targets: 'h2'
      }
    ];
    miningcompany(destinations, { forceUTF8: true, goldwasher: true }, function(response) {
      console.log(response);
      //console.log(response.results[0].nuggets);
      done();
    });
  });
});