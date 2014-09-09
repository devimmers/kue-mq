Kue-mq is mq interface for priority job library [kue](https://github.com/learnboost/kue)

## Getting Started

Install the module with: `npm install kue-mq`

```
var kueMq = require('kue-mq');
```

Documentation
--------------

Main module function:
 
Create new kue-mq server with next params:
  * _opts - options for redis connection and creation of queue
  * _name - name of the server
  * _methods - supported methods for this server

Will return object with property queue and method send.

Redis config opts example:
```
redisConf = {
  prefix: 'q', // q - by default
  redis: {
    port: 6379, // 6379 - by default
    host: '127.0.0.1' // 127.0.0.1 - by default
  }
},
```
After creation sever has next method:

send message to kue-mq server
 * _serverName - name of the server, which will receive message
 * _serverMethod - method of the server, which will process message
 * _data - data for message
 * _options - options for message

This method will return object:  
  {queue, send } with property queue and method send

## Examples

```
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
```
 
## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com).


## License

Copyright (c) 2014 Rudeg  
Licensed under the MIT license.