"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loginWithToken = loginWithToken;

var _loginMethod = require("../common/login-method");

/*
 *   Public methods
 */

function loginWithToken(_ref) {
  var uid = _ref.uid,
      token = _ref.token;

  var auth = {
    uid: uid,
    token: token
  };
  return _loginMethod.onLogin.bind(auth);
} /*
   *   The password-login mixin:
   *   - defines the `createUser` and `loginWithPassword` methods, porcelain for
   *     calling the `createUser` and `login` ddp methods
   */