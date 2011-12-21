// initialize some things

var _ = require('underscore'),
    http = require('http'),
    express = require('express'),
    socketio = require('socket.io');

var nytimes_key = process.env.NYTIMES_KEY,
    app = express.createServer(),
    poll_interval = process.env.POLL_TIME || 1000 * 60,
    seen = [],
    latest = [],
    sockets = [],
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
  console.log("http://" + options.host + options.path);
  http.get(options, function(res) {
    var json = "";
    res.on('data', function(chunk) {
      json += chunk;
    });
    res.on('end', function() {
      if (res.statusCode == 200) {
        console.log(json);
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
 * publish new story to any open sockets or streams
 * 
 * @param {Object} a news story
 */

function publish(story) {
  // publish to socket.io sockets
  console.log("publishing to " + sockets.length + " sockets");
  _.each(sockets, function(socket) {
    socket.emit('story', story);
  });
  // publish to raw http responses
  console.log("publishing to " + streams.length + " streams");
  _.each(streams, function(stream) {
    stream.write(JSON.stringify(story) + "\n");
  });
}

// configure the app

app.configure(function(){
  app.use(express.static(__dirname + '/public'));
});

app.get('/stream/', function(req, res) {
  console.log("adding stream");
  _.each(latest, function(n) {
    res.write(JSON.stringify(n) + "\n");
  });
  streams.push(res);
  req.on('end', function() {
    console.log("removing stream");
    streams = _.without(streams, res);
  });
});

// setup socket.io

io = socketio.listen(app);
io.sockets.on('connection', function(socket) {
  console.log("adding socket");
  _.each(latest, function(s) {
    socket.emit('story', s);
  });
  sockets.push(socket);
  socket.on('disconnect', function() {
    console.log("removing socket");
    sockets = _.without(sockets, socket);
  });
});

// start up the server
app.listen(process.env.PORT || 3000);

// start polling for new stories
poll(publish);
