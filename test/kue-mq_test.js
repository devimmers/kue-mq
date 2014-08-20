/*global describe,it,beforeEach,afterEach*/
'use strict';
var assert = require('assert'),
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
      cb(null, data);
    }
  };

describe('kue-mq node module.', function() {
  var s1, s2;

  beforeEach(function() {
    s1 = kueMq(redisConf, 'test1', serverMethods);
    s2 = kueMq(redisConf, 'test2', serverMethods);
  });

  afterEach(function() {
    s1 = s2 = null;
  });

  it('first server must take answer from second', function(done) {
    s1
      .send('test2', 'run', {'foo': 'bar'})
      .then(function(res) {
        assert(res.foo, 'bar');
        done();
      },
      function(err) {
        console.error(err);
        done(err);
      });
  });
});
