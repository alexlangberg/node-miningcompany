'use strict';

/* exported should */
var chai = require('chai');
    chai.use(require('chai-things'));
var should = chai.should();
var add = require('../index.js');

describe('add', function() {
  it('adds numbers correctly', function(){
    var result = add(1,2);
    result.should.equal(3);
  });
});