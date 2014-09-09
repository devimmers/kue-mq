'use strict';

var kueMq = require("kue-mq");
var redisConf = {
  prefix: 'q', // q - by default
  redis: {
    port: 6379, // 6379 - by default
    host: '127.0.0.1' // 127.0.0.1 - by default
  }
};

var test = kueMq(redisConf, 'test-app', {
  test: function() {
    return true;
  }
});

kueMq.send('test-app', 'test', {}).then(function(data) {
  console.log(data); //here will be true, from our test function
});