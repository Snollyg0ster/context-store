"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
exports.__esModule = true;
exports.createAction = exports.createStore = void 0;
var createStore_1 = require("./createStore");
__createBinding(exports, createStore_1, "default", "createStore");
var utils_1 = require("./utils");
__createBinding(exports, utils_1, "createAction");
