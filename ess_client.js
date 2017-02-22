var HttpRequest = require('./http_request');
var AuthClient = require('./auth_client');
var helper = require('./helper');
var util = require('util');
var fs = require('fs');

var EssClient = function (bucket, private) {
    this.bucket = bucket;
    this.private = private;
};

EssClient.prototype.GetObject = function (key, callback) {
    var method = 'GET';
    var url_path_params = '/' + key;

    var req = new HttpRequest(method, url_path_params, this.bucket, key);
    var client = new AuthClient(req);

    if (this.private) {
        req.setHeader("Date", helper.GetDate());
        client.SendRequest(callback);
    } else {
        client.SendRequest(callback);
    }
};

EssClient.prototype.GetAndSaveObject = function (key, file_path) {
    this.GetObject(key, function (status, req) {
        if (status === 200) {
            req.pipe(fs.createWriteStream(file_path));
        }
    });
};

EssClient.prototype.PutObject = function (key, file_path, callback) {
    var method = 'PUT';
    var url_path_params = '/' + key;

    var req = new HttpRequest(method, url_path_params, this.bucket, key, file_path);
    var client = new AuthClient(req);

    if (this.private) {
        helper.md5AsBase64(file_path, function (md5) {
            req.setHeader("Content-MD5", md5);
            req.setHeader("Date", helper.GetDate());
            client.SendRequest(callback);
        });
    } else {
        client.SendRequest(callback);
    }
};

module.exports = EssClient;