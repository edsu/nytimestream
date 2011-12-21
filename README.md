About
-----

nytimestream is a demonstration of using [Node.js](http://nodejs.org) and 
[Socket.IO](http://socket.io) to create a web based push stream for breaking 
New York Times stories using the 
[Times Newswire API](http://developer.nytimes.com/docs/times_newswire_api). 

Since the Times Newswire API is oriented around an HTTP client polling for new
stories, nytimestream also needs to poll for updates. However nytimestream can poll
*once*, and when a new update is found it is pushed to however many clients have 
subscribed for updates. Compare this to a more traditional scenario where all the 
browser clients need to poll either the nytimes api directly, or a proxy for the
API. nytimestream significantly lowers the amount of traffic going to the Times 
Newswire API, since Node.js is able to keep lots of open network connections to clients 
that are waiting for updates.

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
