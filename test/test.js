'use strict';

/* exported should */
/* jshint expr: true */
//var _ = require('underscore');
var chai = require('chai');
chai.use(require('chai-things'));
chai.use(require('sinon-chai'));
var should = chai.should();
var sinon = require('sinon');
var Miningcompany = require('../lib/miningcompany.js');
var Krawler = require('krawler');
var clock;
var maps = [
  {
    url: 'http://www.github.com',
    targets: 'h1'
  }
];

before(function () {
  clock = sinon.useFakeTimers();
});
after(function () {
  clock.restore();
});

describe('Miningcompany', function () {
  //this.timeout(10000);
  it('can be constructed', function () {
    new Miningcompany(maps);
  });

  it('can be constructed with just a single maps object', function () {
    new Miningcompany(maps[0]);
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
    company.mine.should.have.been.called;
  });

  it('returns a cart after mining with mine()', function () {
    var company = new Miningcompany(maps, {goldwasher: false});
    company.emit = sinon.spy();

    // we inject a Krawler with an hijacked queue() function
    var miner = new Krawler(company._options.krawler);
    miner.queue = function () {
      miner.emit('data', 'cheerioDomStub', 'mapStub', 200);
      miner.emit('error', 'errorStub', 'mapStub');
      miner.emit('end');
    };
    company.mine(miner, maps, company._options);

    var fakeCart = {
      started: 61000,
      results: [{
        map: 'mapStub',
        dom: 'cheerioDomStub',
        response: 200
      }],
      errors: [{
        map: 'mapStub',
        error: 'errorStub'
      }],
      finished: 61000
    };

    company.emit.should.have.been.calledWith('mine');
    company.emit.should.have.been.calledWith('cart', sinon.match(fakeCart));
  });

  it('can return a cart that has been treated by goldwasher', function () {
    var company = new Miningcompany(maps, {goldwasher: true});
    company.emit = sinon.spy();

    var fakeCart = {
      started: 61000,
      results: [{
        map: maps[0],
        dom: '<html><body><h1>Hello world!</h1></body></html>',
        response: 200,
        gold: [{
          timestamp: 61000,
          text: 'Hello world!',
          keywords: [
            {word: 'hello', count: 1},
            {word: 'world:', count: 1}
          ],
          href: null,
          tag: 'h1',
          position: 0
        }]
      }],
      finished: 61000
    };

    // we inject a Krawler with an hijacked queue() function
    var miner = new Krawler(company._options.krawler);
    miner.queue = function () {
      miner.emit('data', fakeCart.results[0].dom, maps[0], 200);
      miner.emit('end');
    };
    company.mine(miner, maps, company._options);

    company.emit.should.have.been.calledWith('cart', sinon.match(fakeCart));
  });

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
