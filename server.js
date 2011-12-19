var _ = require('underscore');
var http = require("http");
var express = require("express");

var nytimes_key = process.env.NYTIMES_KEY
var server = express.createServer();
var poll_interval = 1000 * 60 * 10;
var seen = []
var streams = [];

function home(req, res) {
  nytimes(function(json) {
    res.contentType('application/json');
    res.send(json);
  });
}

function poll() {
  nytimes(function(json) {
    var update = JSON.parse(json);
    _.each(update.results.reverse(), function(i) {
      if (! _.include(seen, i.url)) {
        console.log("found " + i.headline);
        seen.push(i.url);
        // to avoid memory bloat, only remember last 1000 urls
        seen = _.last(seen, 1000);
      }
    });
  });
  setTimeout(poll, poll_interval);
};

function publish() {
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
      if (res.statusCode == 200) f(json);
    });
  }).on('error', function(e) {
    console.log("error: " + e);
  });
}

poll();
server.get('/', home);
server.listen(3000);
