"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
exports.__esModule = true;
exports.getIsRestored = exports.restoreSavedStore = exports.defaultFunctions = exports.deepEqual = exports.createAction = void 0;
var react_1 = require("react");
var defaults_1 = require("./defaults");
function createAction() {
    return function (type) { return function (payload) { return ({ payload: payload, type: type }); }; };
}
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
var deepClone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
};
exports.defaultFunctions = {
    deepClone: deepClone,
    deepEqual: exports.deepEqual
};
var restoreSavedStore = function (options, dispatch, setRestored) {
    if (!(options === null || options === void 0 ? void 0 : options.persistent)) {
        setRestored(true);
        return;
    }
    var persistent = options.persistent;
    if (persistent.storeKeys) {
        var storeKeys_1 = persistent.storeKeys;
        var storeParts = storeKeys_1.map(function (key) {
            return persistent.getData(defaults_1.ctxKey + "-" + key);
        });
        Promise.allSettled(storeParts)
            .then(function (results) {
            return results
                .map(function (res, i) {
                return res.status === "fulfilled" && (res === null || res === void 0 ? void 0 : res.value)
                    ? [storeKeys_1[i], res.value]
                    : undefined;
            })
                .filter(Boolean);
        })
            .then(function (results) {
            var restoredStoreParts = results.reduce(function (acc, _a) {
                var _b;
                var _c = __read(_a, 2), key = _c[0], value = _c[1];
                return (__assign(__assign({}, acc), (_b = {}, _b[key] = value, _b)));
            }, {});
            dispatch((0, defaults_1.internalStateUpdate)(restoredStoreParts));
            setRestored(true);
        });
    }
    else {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, persistent.getData(defaults_1.ctxKey)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        }); })().then(function (restoredStore) {
            //@ts-ignore
            if (restoredStore) {
                dispatch((0, defaults_1.internalStateUpdate)(restoredStore));
            }
            setRestored(true);
        });
    }
};
exports.restoreSavedStore = restoreSavedStore;
var getIsRestored = function () {
    var restored = false;
    var restoredHooksStateAction = new Set();
    var setRestored = function (state) {
        Array.from(restoredHooksStateAction).forEach(function (setState) { return setState(state); });
        restored = state;
    };
    var isRestored = function () {
        var _a = __read((0, react_1.useState)(restored), 2), isReady = _a[0], setIsReady = _a[1];
        (0, react_1.useEffect)(function () {
            restoredHooksStateAction.add(setIsReady);
            (function () { return restoredHooksStateAction["delete"](setIsReady); });
        }, []);
        return isReady;
    };
    return { setRestored: setRestored, isRestored: isRestored };
};
exports.getIsRestored = getIsRestored;
