var _ = require('underscore');
var http = require("http");
var express = require("express");

var nytimes_key = process.env.NYTIMES_KEY
var server = express.createServer();
var streams = [];
var poll_interval = 10000;
var last_seen = "";

function home(req, res) {
  nytimes(function(json) {
    res.contentType('application/json');
    res.send(json);
  });
}

function nytimes(f) {
  options = {
    "host": "api.nytimes.com",
    "path": "/svc/news/v2/all/recent.json?api-key=" + nytimes_key
  };
  http.get(options, function(res) {
    var json = "";
    res.on('data', function(chunk) {
      json += chunk;
    });
    res.on('end', function() {
      f(json);
    });
  });
}

function poll() {
  nytimes(function(json) {
    var update = JSON.parse(json);
    _.each(update.results.reverse(), function(i) {
      if (i.created >= last_seen) {
        console.log("[" + i.created + " > " + last_seen + "] " + i.headline);
        last_seen = i.created;
      }
    });
  });
  setTimeout(poll, poll_interval);
};

poll();
server.get('/', home);
server.listen(3000);
