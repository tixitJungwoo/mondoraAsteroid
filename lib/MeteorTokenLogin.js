/**
 * Created by jungwoo on 2017. 9. 21..
 */

var Asteroid = require('asteroid');
var asteroid = new Asteroid("http://localhost:3000", false);
asteroid.on('connected', function () {
    return cb();
});
asteroid.on('reconnected', function () {
    return cb();
});

debugger;
try {
    asteroid.loginWithToken("7kWWJSz7aKniaA3Bd", "mID5RRZQwBFe4xCoOTjIoVJ6-quCI5E8rh1je75A4cV");
    console.log("Success!");
} catch (e) {
    console.log("Error");
    console.log(e);
}