'use strict';

/* exported should */
var chai = require('chai');
    chai.use(require('chai-things'));
var should = chai.should();
var miningcompany = require('../lib/miningcompany.js');

describe('miningcompany', function() {
  it('it can fetch an url', function(done){
    var destinations = [
      {
        url: 'http://www.b.dk',
        targets: 'h1'
      }
    ];
    miningcompany(destinations, {}, function(response) {
      console.log(response.results[0].nuggets);
      done();
    });
  });
});