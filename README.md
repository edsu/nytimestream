About
-----

nytimestream is a demonstration of using [node.js](http://nodejs.org) and 
[socket.io](http://socket.io) to create a web based push stream for breaking 
New York Times stories using the 
[Times Newswire API](http://developer.nytimes.com/docs/times_newswire_api). 

Since the Times Newswire API is based on an HTTP client polling for requests,
nytimestream needs to poll for updates. However only one process needs to poll 
for updates at the NYTimes (the server). When a new update is found it is 
pushed to however many clients (browsers) have subscribed for updates. Compare
this to a more traditional scenario where all the browser clients would need 
to poll either the nytimes api directly, or a proxy for the api.

Setup
-----

1. install node
1. install npm
1. get a NYTimes developer key for [Times Newswire](http://developer.nytimes.com/docs/read/reference/keys)
1. `npm install`
1. `NYTIMES_KEY="YOUR_API_KEY_HERE" node app.js`
1. point your browser at `http://localhost:3000/`

License
-------

Public Domain
