'use strict';

/* exported should */
/* jshint expr: true */

var chai = require('chai');
chai.use(require('chai-things'));
chai.use(require('sinon-chai'));
var should = chai.should();
var sinon = require('sinon');
var cheerio = require('cheerio');
var Miningcompany = require('../lib/miningcompany.js');
var Krawler = require('krawler');
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
    var miner = new Krawler(company._options.krawler);

    company.emit = sinon.spy();

    sinon.stub(miner, 'queue', function() {
      miner.emit('data', 'cheerioDomStub', 'mapStub', 200);
      miner.emit('error', 'errorStub', 'mapStub');
      miner.emit('end');
    });

    company.mine(miner, maps, company._options);

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

  it('can get the closest href(link) of a cheerio object', function(done) {
    var company = new Miningcompany(maps);
    var $ = cheerio.load(
        '<div><a href="http://foo.com/bar"><h1>baz</h1></a></div>' +
        '<div><h1><a href="http://foo.com/bar">baz</a></h1></div>' +
        '<div><h1>baz</h1><a href="http://foo.com/bar">link</a></div>' +
        '<div><a class="t" href="http://foo.com/bar">baz</a></div>' +
        '<div><a class="t" href="/bar">baz</a></div>'
    );
    $('h1, a.t').each(function() {
      $(this).text().should.equal('baz');

      company.getClosestHref('http://foo.com', $(this))
        .should.equal('http://foo.com/bar');
    });

    done();
  });

  it('returns null if it cannot find href', function(done) {
    var company = new Miningcompany(maps);
    var $ = cheerio.load(
      '<div><h1>baz</h1></div>'
    );

    $('h1').each(function() {

      // no link found, should return null
      should.not.exist(company.getClosestHref('http://foo.com', $(this)));
    });

    done();
  });
});
