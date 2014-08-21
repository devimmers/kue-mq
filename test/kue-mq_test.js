/*global describe,it,beforeEach,afterEach*/
'use strict';
var assert = require('assert'),
  sinon = require('sinon'),
  kueMq = require('../lib/kue-mq.js'),
  redisConf = {
    prefix: 'q',
    redis: {
        port: 6379,
        host: '146.185.188.32'
    }
  },
  serverMethods = {
    run: function(data, cb) {
      if (data.flag === undefined) {
        data.flag = true;
      } else {
        data.flag = !data.flag;
      }
      cb(null, data);
    },
    runErrored: function(data, cb) {
      cb('fatal error!');
    },
    runEmpty: function() {},
    runWithDelay: function(data, cb) {
      setTimeout(function() {
        cb(null, data);
      }, 100);
    }
  };

describe('kue-mq node module.', function() {
  var s1, s2, count = 0, resp = 0;

  beforeEach(function() {
    s1 = kueMq(redisConf, 'test1', serverMethods);
    s2 = kueMq(redisConf, 'test2', serverMethods);
  });

  afterEach(function() {
    s1 = s2 = null;
    count = resp = 0;
  });

  it('first server must take answer from second', function(done) {
    s1
      .send('test2', 'run', {'foo': 'bar'})
      .then(function(res) {
        assert.equal(res.data.foo, 'bar');
        assert.ok(res.data.flag);
        done();
      });
  });

  it('first server must take answer from second check by id', function(done) {
    var req = s1.send('test2', 'run', {'foo': 'bar'});

    req
      .then(function(res) {
        assert.equal(res.data.foo, 'bar');
        assert.ok(res.data.flag);
        assert.equal(res.job.id, req.job.id);
        done();
      });
  });

  it('first server must take resolve on data', function(done) {
    var resolve = sinon.spy(),
      reject = sinon.spy();
    s1
      .send('test2', 'run', {'foo': 'bar'})
      .then(resolve, reject)
      .finally(function() {
        assert.ok(resolve.calledOnce);
        assert.equal(reject.callCount, 0);
        done();
      });
  });

  it('first server must take reject on error', function(done) {
    var resolve = sinon.spy(),
      reject = sinon.spy();
    s1
      .send('test2', 'runErrored', {'foo': 'bar'})
      .then(resolve, reject)
      .finally(function() {
        assert.ok(reject.calledOnce);
        assert.equal(resolve.callCount, 0);
        done();
      });
  });

  it('first server must take reject on timeout error', function(done) {
    var resolve = sinon.spy(),
      reject = sinon.spy();
    s1
      .send('test2', 'runEmpty', {'foo': 'bar'})
      .then(resolve, reject)
      .finally(function() {
        assert.ok(reject.calledOnce);
        assert.equal(resolve.callCount, 0);
        done();
      });
  });

  it('first server must pipe result through second server', function(done) {
    s1
      .send('test2', 'run', {'foo': 'bar'})
      .then(function(res) {
        assert.equal(res.data.foo, 'bar');
        assert.ok(res.data.flag);
        res.data.foo1 = 'bar1';

        return s2.send('test1', 'run', res.data);
      })
      .then(function(res) {
        assert.equal(res.data.foo1, 'bar1');
        assert.notStrictEqual(res.data.flag, true);
        done();
      });
  });

  it('first server must take answer from second x 100', function(done) {
    var timer,
      complite = function(res) {
        assert.equal(res.data.foo, 'bar');
        resp++;
        if (resp === 100) {
          done();
        }
      };

    timer = setInterval(function() {
      if (count === 100) {
        clearTimeout(timer);
        return;
      }
      count++;
      s1
        .send('test2', 'runWithDelay', {'foo': 'bar'}, {timeout: 11000})
        .then(complite);
    }, 10);
  });
});
