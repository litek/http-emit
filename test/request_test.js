"use strict";
var request = require("../lib/request.js"),
    http = require("http"),
    fs = require("fs");

describe("req", function() {
  it("emits http requests", function(done) {
    var server = http.createServer(function(req, res) {
      res.writeHead(200, {"Content-Type": "text/plain"});
      res.write("Hello, world");
      process.nextTick(function() {
        res.write("!");
        res.end();
      });
    });

    var req = request({server: server}, function(res) {
      res.headers["content-type"].should.equal("text/plain");

      var data = "";
      res.on("data", function(buf) {
        data += buf;
      });

      res.on("end", function() {
        data.should.equal("Hello, world!");
        done();
      });
    });

    req.on("error", done);

    req.end();
  });
});

