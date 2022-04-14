const MAX_TRY = 3;

function Defer() {
  this.promise = new Promise((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;
  })
}

function tryAdapter(config) {
  var adapter = config.adapter && config.adapter !== tryAdapter ? config.adapter : getDefaultAdapter();
  var maxRetry = config.maxRetry || MAX_TRY;
  var retryDelay = exponentialDelay;
  var retry = config.retry || 0;

  var defer = new Defer();

  var request = adapter(config);

  request.then(function _resolve(response) {
    defer.resolve(response);
  });

  request.catch(function _reject(err) {
    if (retry++ < maxRetry) {
      config.retry = retry;
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[axios] take another try: (${retry}/${maxRetry}) times` );
      }
      setTimeout(function _retry() {
        tryAdapter(config).then(defer.resolve, defer.reject);
      }, retryDelay(retry));
    } else {
      defer.reject(err);
    }
  });

  return defer.promise;
}

/**
 * @see https://developers.google.com/analytics/devguides/reporting/core/v3/errors#backoff
 * @param {number} retry
 */
function exponentialDelay(retryCount) {
  return Math.pow(2, retryCount - 1) * 1000;
}

module.exports.exponentialDelay = exponentialDelay;

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== "undefined") {
    // For browsers use XHR adapter
    adapter = require("axios/lib/adapters/xhr");
  } else if (
    typeof process !== "undefined" &&
    Object.prototype.toString.call(process) === "[object process]"
  ) {
    // For node use HTTP adapter
    adapter = require("axios/lib/adapters/http");
  }
  return adapter;
}

module.exports = tryAdapter;
