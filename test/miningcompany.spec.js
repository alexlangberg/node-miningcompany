'use strict';

/* exported should */
/* jshint expr: true */

var chai = require('chai');
chai.use(require('chai-things'));
chai.use(require('sinon-chai'));
var should = chai.should();
var sinon = require('sinon');
var Miningcompany = require('../lib/miningcompany.js');
var clock;
var maps = [
  {
    url: 'http://www.github.com',
    targets: 'h1'
  }
];

before(function() {
  clock = sinon.useFakeTimers();
});

after(function() {
  clock.restore();
});

describe('Miningcompany', function() {

  it('can be constructed', function() {
    new Miningcompany(maps);
  });

  it('can be constructed with just a single maps object', function() {
    new Miningcompany(maps[0]);
  });

  it('throws if no maps are provided', function() {
    should.throw(function() {
      new Miningcompany();
    });
  });

  it('throws if maps is not either an array or an object', function() {
    should.throw(function() {
      new Miningcompany(1337);
    });
  });

  it('throws if options parameter is not an object', function() {
    should.throw(function() {
      new Miningcompany(maps, 1337);
    });
  });

  it('sets default options if none are provided', function() {
    var company = new Miningcompany(maps);
    company._options.should.have.property('schedule');
    company._options.should.have.property('krawler');
  });

  it('instantiates a Krawler', function() {
    var company = new Miningcompany(maps);
    company.should.have.property('_krawler');
  });

  it('makes itself an EventEmitter', function() {
    var company = new Miningcompany(maps);
    company.should.have.property('_events');
  });

  it('calls plan() when open() is called', function() {
    var company = new Miningcompany(maps);
    company.emit = sinon.spy();
    company.plan = sinon.spy();
    company.open();
    company.emit.should.have.been.calledWith('open');
    company.plan.should.have.been.calledWith(company._options);
  });

  it('sets up scheduler that calls mine(), when plan() is called', function() {
    var company = new Miningcompany(maps);
    company.emit = sinon.spy();
    company.mine = sinon.spy();
    company.open();
    company.emit.should.have.been.calledWith('plan');

    // runs every minute by default so tick 61 seconds
    clock.tick(61000);
    company.mine.should.have.been.called;
  });

  it('returns a cart after mining with mine()', function() {
    var company = new Miningcompany(maps);

    company.emit = sinon.spy();

    sinon.stub(company._krawler, 'queue', function() {
      company._krawler.emit('data', 'cheerioDomStub', 'mapStub', 200);
      company._krawler.emit('error', 'errorStub', 'mapStub');
      company._krawler.emit('end');
    });

    company.mine(maps, company._options);

    company.emit.should.have.been
      .calledWith('mine');
    company.emit.should.have.been
      .calledWith('cart', sinon.match.has('uuid'));
    company.emit.should.have.been
      .calledWith('cart', sinon.match.has('started'));
    company.emit.should.have.been
      .calledWith('cart', sinon.match.has('finished'));
    company.emit.should.have.been
      .calledWith('cart', sinon.match.has('results'));
    company.emit.should.have.been
      .calledWith('cart', sinon.match.has('errors'));
  });

  it('can shut down with shut()', function() {
    var company = new Miningcompany(maps);
    company.emit = sinon.spy();
    company.open();
    company._scheduler.cancel = sinon.spy();
    company.shut();
    company.emit.should.have.been.calledWith('shut');
    company._scheduler.cancel.should.have.callCount(1);
  });
});