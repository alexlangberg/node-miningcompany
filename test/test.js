'use strict';

/* exported should */
var chai = require('chai');
    chai.use(require('chai-things'));
var should = chai.should();
var Miningcompany = require('../lib/miningcompany.js');

describe('miningcompany', function() {
  this.timeout(10000);
  it('it can fetch an url', function(){
    var maps = [
      {
        url: 'http://www.pol.dk',
        targets: 'h2'
      }
    ];
    var company = new Miningcompany(maps);
  });
});