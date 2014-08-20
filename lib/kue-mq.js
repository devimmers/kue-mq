/*
 * 
 * https://github.com/Rudeg/kue-mq
 *
 * Copyright (c) 2014 Rudeg
 * Licensed under the MIT license.
 */

'use strict';
var kue = require('kue'),
    Promise = require('bluebird');

var kue_mq = function (_opts, _name, _methods) {

    var queue = kue.createQueue({
        prefix: _opts.prefix || 'q',
        redis: {
            port: _opts.redis.port || 6379,
            host: _opts.redis.host || '127.0.0.1',
            auth: _opts.redis.auth ||'',
            db: _opts.redis.db,
            options: _opts.redis.options
        }
    });

    var send = function (_serverName, _serverMethod, _data) {
        return new Promise(function (resolve, reject) {
            var server_info = _serverName + ':' + _serverMethod;
            var job = queue.create(server_info, _data);
            job.on('failed', reject);
            job.on('complete', resolve);
            job.save(function (err) {
                if (!err) reject(err);
            });
        });
    };

    return {
        queue: queue,
        send: send
    }

};

module.exports = kue_mq;
