"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.subscribe = subscribe;
exports.unsubscribe = unsubscribe;
exports.init = init;

var _lodash = require("lodash.assign");

var _lodash2 = _interopRequireDefault(_lodash);

var _wolfy87Eventemitter = require("wolfy87-eventemitter");

var _wolfy87Eventemitter2 = _interopRequireDefault(_wolfy87Eventemitter);

var _subscriptionCache = require("../common/subscription-cache");

var _subscriptionCache2 = _interopRequireDefault(_subscriptionCache);

var _fingerprintSub = require("../common/fingerprint-sub");

var _fingerprintSub2 = _interopRequireDefault(_fingerprintSub);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
*   Private methods: they are invoked with the asteroid instance as context, but
*   they are not exported so they don't clutter the Asteroid class prototype.
*/

/*
*   The subscriptions mixin:
*   - defines the `subscribe` and `unsubscribe` methods, used to send ddp `sub`
*     and `unsub` messages to the server. In order to do so - due to the
*     asynchronicity of the ddp sub and unsub calls - it must maintain a cache
*     (under the `subscriptions.cache` property of the Asteroid instance) of ddp
*     subscriptions. The cache is then used to match ddp `ready` and `nosub`
*     messages received from the server, and to restart active subscriptions in
*     the event of a reconnection (since Meteor does not support resuming ddp
*     sessions, as of version 1.2.0.2)
*/

function restartSubscription(sub) {
    // Only restart the subscription if it isn't still in ddp's queue.
    if (!sub.stillInQueue) {
        // Handlers to ddp's connected event are invoked asynchronously (see
        // https://github.com/mondora/ddp.js/blob/master/src/ddp.js#L20).
        // Therefore there is a (very very small) chance that between the time
        // when the connected message is received and the time when the
        // connected handler is invoked, the ddp instance disconnected.
        // Therefore we update the stillInQueue status fo the subscription
        this.ddp.sub(sub.name, sub.params, sub.id);
        sub.stillInQueue = this.ddp.status !== "connected";
    } else {
        // Since we're restarting subscriptions after a connection, we know
        // that now the subscriptions which were in ddp's queue will be sent,
        // therefore we need to remove the stillInQueue flag from them
        sub.stillInQueue = false;
    }
}

/*
*   Public methods
*/

function subscribe(name) {
    for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        params[_key - 1] = arguments[_key];
    }

    var fingerprint = (0, _fingerprintSub2.default)(name, params);
    var sub = this.subscriptions.cache.get(fingerprint);
    if (!sub) {
        // If there is no cached subscription, subscribe
        var id = this.ddp.sub(name, params);
        // ddp.js enqueues messages to send if a connection has not yet been
        // established. Upon connection, when subscriptions are restarted, we
        // don't want to restart those subscriptions which had been made when
        // the connection had not yet been established, and therefore are still
        // in the queue. For this reason, we save ddp's connection status onto
        // the subscription object and we check it later to decide wether to
        // restart the subscription or not.
        var stillInQueue = this.ddp.status !== "connected";
        // Build the subscription object and save it in the cache
        sub = (0, _lodash2.default)(new _wolfy87Eventemitter2.default(), { fingerprint: fingerprint, id: id, name: name, params: params, stillInQueue: stillInQueue });
        this.subscriptions.cache.add(sub);
    }
    // Return the subscription object
    return sub;
}

function unsubscribe(id) {
    this.ddp.unsub(id);
}

/*
*   Init method
*/

function init() {
    var _this = this;

    this.subscriptions = {
        cache: new _subscriptionCache2.default()
    };
    this.ddp.on("ready", function (_ref) {
        var subs = _ref.subs;

        subs.forEach(function (id) {
            _this.subscriptions.cache.get(id).emit("ready");
        });
    }).on("nosub", function (_ref2) {
        var error = _ref2.error,
            id = _ref2.id;

        if (error) {
            _this.subscriptions.cache.get(id).emit("error", error);
        }
        _this.subscriptions.cache.del(id);
    }).on("connected", function () {
        _this.subscriptions.cache.forEach(restartSubscription.bind(_this));
    });
}