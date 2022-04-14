var express = require("express");
var morgan = require("morgan");
var parcel = require('parcel-bundler');

var app = express();

app.use(morgan("dev"));

var count = 0

app.get("/echo/:data", (req, res) => {
  // fail odd request
  if (++count % 2) {
    return res.send(500).end()
  } else {
    count = 0
  }
  return res.send(JSON.stringify(req.params)).end()
});

var bundler = new parcel(__dirname + '/index.html', {})

bundler.bundle().then(() => {
  app.use(express.static(__dirname + '/dist'));
  app.listen(3000);
})
