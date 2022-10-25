"use strict";
exports.__esModule = true;
exports.deepEqual = exports.createAction = void 0;
var createAction = function () { return function (type) {
    return (function (payload) {
        return {
            type: type,
            payload: payload
        };
    });
}; };
exports.createAction = createAction;
var deepEqual = function (x, y) {
    if (x === y) {
        return true;
    }
    else if (typeof x === "object" &&
        x != null &&
        typeof y === "object" &&
        y != null) {
        if (Object.keys(x).length !== Object.keys(y).length)
            return false;
        for (var prop in x) {
            if (y.hasOwnProperty(prop)) {
                if (!(0, exports.deepEqual)(x[prop], y[prop]))
                    return false;
            }
            else
                return false;
        }
        return true;
    }
    else
        return false;
};
exports.deepEqual = deepEqual;
