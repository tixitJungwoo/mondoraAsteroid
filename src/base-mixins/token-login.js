/*
 *   The password-login mixin:
 *   - defines the `createUser` and `loginWithPassword` methods, porcelain for
 *     calling the `createUser` and `login` ddp methods
 */
import {onLogin} from "../common/login-method";
/*
 *   Public methods
 */

export function loginWithToken({uid, token}) {
    const auth = {
        uid,
        token
    };
    return onLogin.bind(auth);
}
