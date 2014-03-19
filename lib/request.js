"use strict";
var stream = require("stream"),
    util = require("util"),
    http = require("http"),
    https = require("https");

/**
 * http.request function with default parameters
 * An additional server param is required
 */
var request = module.exports = function(options, fn) {
  options = options || {};
  Object.keys(request.defaults).forEach(function(key) {
    options[key] = request.defaults[key];
  });

  if (!options.server || !(options.server instanceof http.Server)) {
    if (options.server instanceof https.Server) {
      throw new Error("Https is not supported");
    }

    throw new Error("Expected a http server object");
  }

  var req = http.request(options, fn);

  return req;
};

request.defaults = {
  agent: null,
  defaultPort: 80,
  createConnection: function(opts) {
    return new Proxy(opts);
  }
};

/**
 * Creates two stream objects, one request and one response
 */
util.inherits(Proxy, stream.PassThrough);

function Proxy(opts) {
  stream.PassThrough.call(this);

  if (!(opts instanceof Proxy)) {
    this.type = "request";
    this.sibling = new Proxy(this);
    opts.server.emit("connection", this.sibling);
  } else {
    this.type = "response";
    this.sibling = opts;
  }
}

Proxy.prototype._write = function(chunk, encoding, done) {
  // ondata events for 0.10, just pass through for 0.11
  if (this.ondata) {
    if (this.type === "request") {
      this.sibling.ondata(chunk, 0, chunk.length);
    } else {
      this.push(chunk);
    }
  } else {
    this.sibling.push(chunk);
  }

  if (done) done();
};

Proxy.prototype.destroySoon = function() {
  if (this.ondata && this.type === "response") {
    this.end(function() {
      var chunk = this.read();
      this.sibling.ondata(chunk, 0, chunk.length);
    }.bind(this));
  }

  this.writable = false;
};

Proxy.prototype.destroy = Proxy.prototype.end;

Proxy.prototype.setTimeout = function(ms) {
};
