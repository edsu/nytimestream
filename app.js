// initialize some things

var _ = require('underscore'),
    http = require('http'),
    express = require('express'),
    socketio = require('socket.io');

var nytimes_key = process.env.NYTIMES_KEY,
    app = express.createServer(),
    poll_interval = 1000 * 60,
    seen = [],
    latest = [],
    streams = [];

/**
 * look for new stories
 *
 * @param {Function} a callback that receives a new story
 */

function poll(f) {
  console.log("polling for new stories");
  nytimes(function(news) {
    _.each(news, function(i) {
      if (! _.include(seen, i.url)) {
        f(i);
        seen.push(i.url);
        // to avoid memory bloat, only remember last 1000 urls
        seen = _.last(seen, 1000);
      }
    });
  });
  setTimeout(poll, poll_interval, f);
};

/**
 * fetch new stories from the NYTimes API
 *
 * @param {Function} a callback that receives current stories
 */

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
      if (res.statusCode == 200) {
        times = JSON.parse(json);
        latest = times.results.reverse().slice(10);
        f(latest);
      }
    });
  }).on('error', function(e) {
    console.log("error: " + e);
  });
}

/**
 * publish new story to any open streams
 * 
 * @param {Object} a news story
 */

function publish(story) {
  _.each(streams, function(stream) {
    stream.emit('story', story);
  });
}

// configure the app

app.configure(function(){
  app.use(express.static(__dirname + '/public'));
});

// setup socket.io

io = socketio.listen(app);
io.sockets.on('connection', function(socket) {
  console.log("adding socket");
  _.each(latest, function(s) {
    socket.emit('story', s);
  });
  streams.push(socket);
  socket.on('disconnect', function() {
    console.log("removing socket");
    streams = _.without(streams, socket);
  });
});

// start up the server
app.listen(app.listen(process.env.PORT || 3000);

// start polling for new stories
poll(publish);
