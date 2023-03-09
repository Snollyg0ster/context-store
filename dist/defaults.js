"use strict";
exports.__esModule = true;
exports.internalStateUpdate = exports.internalType = exports.ctxKey = void 0;
exports.ctxKey = "context-store";
exports.internalType = Symbol("internalUpdate");
var internalStateUpdate = function (payload) { return ({
    type: exports.internalType,
    payload: payload
}); };
exports.internalStateUpdate = internalStateUpdate;
