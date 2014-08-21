/*
 * 
 * https://github.com/Rudeg/kue-mq
 *
 * Copyright (c) 2014 Rudeg
 * Licensed under the MIT license.
 */
'use strict';
var kue = require('kue'),
    Promise = require('bluebird');// jshint ignore:line

/**
 * Create new kue-mq server
 * @param {object} _opts - options for redis connection and creation of queue
 * @param {object} _name - name of the server
 * @param {object} _methods - supported methods for this server
 *
 * @returns {object} with property queue and method send
 */
var kue_mq = function (_opts, _name, _methods) {

    var queue = kue.createQueue({
        prefix: _opts.prefix || 'q',
        redis: {
            port: _opts.redis.port || 6379,
            host: _opts.redis.host || '127.0.0.1',
            auth: _opts.redis.auth || '',
            db: _opts.redis.db,
            options: _opts.redis.options
        }
    });

    queue.process(_name, function(job, done) {
        var _serverMethod = job.data._serverMethod;
        if (!_methods.hasOwnProperty(_serverMethod)) {
            done('This method does not support by this server');
        }
        _methods[_serverMethod](job.data, done);
    });


    /**
     * send message to kue-mq server
     * @param {string} _serverName - name of the server
     * @param {string} _serverMethod - method of the server
     * @param {object} _data - data for method
     * @param {object} _options - options
     *
     * @returns { queue, send } with property queue and method send
     */

    var send = function (_serverName, _serverMethod, _data, _options) {
        _options = _options || {};
        var job;
        var promise = new Promise(function (resolve, reject) {
            _data._serverMethod = _serverMethod;
            job = queue.create(_serverName, _data);

            var timeoutCall = setTimeout(function () {
                reject('Timeout error by call of ' + _serverMethod);
            }, _options.timeout || 7000);

            job.on('failed', function (err) {
                clearTimeout(timeoutCall);
                reject(err);
            });

            job.on('complete', function (result, err) {
                clearTimeout(timeoutCall);
                if (err) { return reject(err); }
                resolve({
                    data: result,
                    job: job
                });
            });

            job.save(function (err) {
                if (err) {
                    clearTimeout(timeoutCall);
                    reject(err);
                }
            });
        });
        promise.job = job;
        return promise;
    };

    return {
        queue: queue,
        send: send
    };

};

module.exports = kue_mq;
