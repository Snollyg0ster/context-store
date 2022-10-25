"use strict";
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
exports.__esModule = true;
var react_1 = require("react");
var utils_1 = require("./utils");
var deepClone = function (obj) { return JSON.parse(JSON.stringify(obj)); };
var defaultFunctions = {
    deepClone: deepClone,
    deepEqual: utils_1.deepEqual
};
var createStore = function (initState, reducer, options) {
    var deepClone = (options === null || options === void 0 ? void 0 : options.deepClone) || defaultFunctions.deepClone;
    var deepEqual = (options === null || options === void 0 ? void 0 : options.deepEqual) || defaultFunctions.deepEqual;
    var listeners = new Map();
    var prevStore = initState;
    var middlewareReducer = function (store, action) {
        var e_1, _a;
        var newStore = deepClone(store);
        var returnedStore = {};
        if (typeof reducer === "function") {
            returnedStore = reducer(newStore, action);
        }
        else {
            Object.entries(reducer).forEach(function (prop) {
                var _a = __read(prop, 2), key = _a[0], reduce = _a[1]; // @ts-ignore
                var result = reduce(newStore[key], action);
                if (result) {
                    // @ts-ignore
                    returnedStore[key] = result;
                }
            });
        } // @ts-ignore
        Object.assign(newStore, returnedStore);
        var _loop_1 = function (selector, callback) {
            var prev = selector(prevStore);
            var curr = selector(newStore);
            if (!deepEqual(prev, curr)) {
                setTimeout(function () {
                    callback(curr);
                });
            }
        };
        try {
            for (var _b = __values(listeners.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = _c.value, selector = _d.selector, callback = _d.callback;
                _loop_1(selector, callback);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        prevStore = newStore;
        return newStore;
    };
    var draftDispatch = function (action) { };
    var Store = (0, react_1.createContext)({
        dispatch: draftDispatch
    });
    var StoreProvider = function (props) {
        var children = props.children;
        var _a = __read((0, react_1.useReducer)(middlewareReducer, initState), 2), dispatch = _a[1];
        var contextValue = (0, react_1.useMemo)(function () { return ({ dispatch: dispatch }); }, []);
        return (0, react_1.createElement)(Store.Provider, { value: contextValue, children: children });
    };
    var useSelector = function (selector) {
        var isProviderChild = (0, react_1.useContext)(Store);
        var _a = __read((0, react_1.useState)(selector(prevStore)), 2), value = _a[0], setValue = _a[1];
        (0, react_1.useEffect)(function () {
            var id = Symbol("listenerId");
            listeners.set(id, {
                selector: selector,
                callback: setValue
            });
            return function () {
                listeners["delete"](id);
            };
        }, []);
        return value;
    };
    var useDispatch = function () { return (0, react_1.useContext)(Store).dispatch; };
    return { StoreProvider: StoreProvider, useSelector: useSelector, useDispatch: useDispatch };
};
exports["default"] = createStore;
