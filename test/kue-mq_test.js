/*global describe,it*/
'use strict';
var assert = require('assert'),
  kueMq = require('../lib/kue-mq.js');

describe('kue-mq node module.', function() {
  it('must be awesome', function() {
    assert( kueMq .awesome(), 'awesome');
  });
});
