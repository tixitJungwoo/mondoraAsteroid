"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createUser = createUser;
exports.loginWithToken = loginWithToken;

var _loginMethod = require("../common/login-method");

/*
 *   Public methods
 */

function createUser(_ref) {
    var username = _ref.username,
        email = _ref.email,
        password = _ref.password;

    var options = {
        password: password,
        user: {
            username: username,
            email: email
        }
    };
    return this.call("createUser", options).then(_loginMethod.onLogin.bind(this));
} /*
   *   The password-login mixin:
   *   - defines the `createUser` and `loginWithPassword` methods, porcelain for
   *     calling the `createUser` and `login` ddp methods
   */
function loginWithToken(_ref2) {
    var uid = _ref2.uid,
        token = _ref2.token;

    var auth = {
        uid: uid,
        token: token
    };
    return _loginMethod.onLogin.bind(auth);
}