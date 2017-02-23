'use strict';

var HttpRequest = require('./http_request');
var AuthClient = require('./auth_client');
var helper = require('./helper');
var util = require('util');
var fs = require('fs');

var EssClient = function (params) {
    params = params || {};
    this.params = params;
    this.bucket = params.bucket;
    this.private = params.private;
};

EssClient.prototype.GetObject = function (key) {
    var method = 'GET';
    var url_path_params = '/' + key;

    var req = new HttpRequest(method, url_path_params, this.bucket, key);
    var client = new AuthClient(req, this.params);

    return new Promise((resolve, reject) => {
        var callback = function (code, request) {
            if (code instanceof Error) {
                return reject(code);
            }

            if (code !== 200) {
                return reject(request);
            }

            resolve(request);
        }

        if (this.private) {
            req.setHeader("Date", helper.GetDate());
            client.SendRequest(callback);
        } else {
            client.SendRequest(callback);
        }
    });
};

EssClient.prototype.GetAndSaveObject = function (key, file_path) {
    this.GetObject(key, function (status, req) {
        if (status === 200) {
            req.pipe(fs.createWriteStream(file_path));
        }
    });
};

EssClient.prototype.PutObject = function (key, file_path) {
    var method = 'PUT';
    var url_path_params = '/' + key;

    var req = new HttpRequest(method, url_path_params, this.bucket, key, file_path);
    var client = new AuthClient(req, this.params);

    return new Promise( (resolve, reject) => {
        var callback = function (code, request) {
            if (code instanceof Error) {
                return reject(code);
            }

            if (code !== 200) {
                return reject(request);
            }

            resolve(request);
        }

        if (this.private) {
            helper.md5AsBase64(file_path, function (md5) {
                req.setHeader("Content-MD5", md5);
                req.setHeader("Date", helper.GetDate());
                client.SendRequest(callback);
            });
        } else {
            client.SendRequest(callback);
        }
    })

};

module.exports = EssClient;