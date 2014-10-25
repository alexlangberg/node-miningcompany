'use strict';

/* exported should */
//var _ = require('underscore');
var chai = require('chai');
chai.use(require('chai-things'));
chai.use(require('sinon-chai'));
var should = chai.should();
var sinon = require('sinon');
var Miningcompany = require('../lib/miningcompany.js');
var clock;
var maps = [
  {
    url: 'http://www.reddit.com',
    targets: 'a.title'
  }
];
var fakeDom = '<html><body><h1>Hello world!</h1></body></html>';

before(function () {
  clock = sinon.useFakeTimers();
});
after(function () {
  clock.restore();
});

describe('miningcompany', function () {
  //this.timeout(10000);
  it('it can be constructed', function () {
    new Miningcompany(maps);
  });

  it('throws if no maps are provided', function () {
    should.throw(function () {
      new Miningcompany();
    });
  });

  it('throws if maps is not either an array or an object', function () {
    should.throw(function () {
      new Miningcompany(1337);
    });
  });

  it('throws if options parameter is not an object', function () {
    should.throw(function () {
      new Miningcompany(maps, 1337);
    });
  });

  it('sets default options if none are provided', function () {
    var company = new Miningcompany(maps);
    company._options.should.have.property('schedule');
    company._options.should.have.property('krawler');
    company._options.should.have.property('goldwasher');
  });

  it('makes itself an EventEmitter', function () {
    var company = new Miningcompany(maps);
    company.should.have.property('_events');
  });

  it('calls plan() when open() is called', function () {
    var company = new Miningcompany(maps);
    company.emit = sinon.spy();
    company.plan = sinon.spy();
    company.open();
    company.emit.should.have.been.calledWith('open');
    company.plan.should.have.been.calledWith(company._options);
  });

  it('sets up scheduler that calls mine(), when plan() is called', function () {
    var company = new Miningcompany(maps);
    company.emit = sinon.spy();
    company.mine = sinon.spy();
    company.open();
    company.emit.should.have.been.calledWith('plan');
    // runs every minute by default so tick 61 seconds
    clock.tick(61000);
    company.mine.should.have.been.calledWith(company.maps, company._options);
  });

  it('returns a cart after mining with mine()', function () {
    var company = new Miningcompany(maps);
    company.emit = sinon.spy();
    company.mine(maps, company._options);
    company.emit.should.have.been.calledWith('mine');
  });

  //it('can wash the content of a cart', function () {
  //  var company = new Miningcompany(maps, {goldwasher: true});
  //  company.emit = sinon.spy();
  //  company.emit.should.have.been.calledWith('wash');
  //});

  it('can shut down with shut()', function () {
    var company = new Miningcompany(maps);
    company.emit = sinon.spy();
    company.open();
    company._scheduler.cancel = sinon.spy();
    company.shut();
    company.emit.should.have.been.calledWith('shut');
    company._scheduler.cancel.should.have.callCount(1);
  });
});