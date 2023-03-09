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
var defaults_1 = require("./defaults");
var utils_1 = require("./utils");
var createStore = function (initState, reducer, options) {
    var deepClone = (options === null || options === void 0 ? void 0 : options.deepClone) || utils_1.defaultFunctions.deepClone;
    var deepEqual = (options === null || options === void 0 ? void 0 : options.deepEqual) || utils_1.defaultFunctions.deepEqual;
    var saveStoreChanges = !!((options === null || options === void 0 ? void 0 : options.persistent) &&
        (!("use" in options.persistent) || options.persistent.use));
    var listeners = new Map();
    var prevStore = initState;
    // type ReducersActions = Reducer extends (...args: any[]) => any
    // 	? ParamOfIndex<Reducer, 1>
    // 	: ParamOfIndex<Exclude<ValueOf<Reducer>, undefined>, 1>;
    var store = initState;
    //trigger useSelector listeners if listener returned value has changed, after reducer change the store
    var middlewareReducer = function (action) {
        var e_1, _a;
        var newStore = deepClone(store);
        var returnedStore = {};
        //@ts-ignore
        if (action.type === defaults_1.internalType) {
            returnedStore = action.payload;
        }
        else if (typeof reducer === "function") {
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
        try {
            for (var _b = __values(listeners.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = _c.value, selector = _d.selector, callback = _d.callback;
                var prev = selector(prevStore);
                var curr = selector(newStore);
                if (!deepEqual(prev, curr)) {
                    callback(curr);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (saveStoreChanges && //@ts-ignore
            action.type !== defaults_1.internalType &&
            options.persistent) {
            if (options.persistent.storeKeys) {
                options.persistent.storeKeys.forEach(function (key) {
                    // @ts-ignore
                    options.persistent.setData(defaults_1.ctxKey + "-" + key, newStore[key]);
                });
            }
            else {
                options.persistent.setData(defaults_1.ctxKey, newStore);
            }
        }
        prevStore = newStore;
        store = newStore;
    };
    var _a = (0, utils_1.getIsRestored)(), isRestored = _a.isRestored, setRestored = _a.setRestored;
    var draftDispatch = function (action) {
        throw Error("You cant use dispatch outside of StoreProvider!");
    };
    var Store = (0, react_1.createContext)({
        dispatch: draftDispatch
    });
    var dispatch = middlewareReducer;
    var StoreProvider = function (props) {
        var children = props.children;
        var contextValue = (0, react_1.useMemo)(function () { return ({ dispatch: dispatch }); }, []);
        (0, react_1.useEffect)(function () {
            saveStoreChanges
                ? (0, utils_1.restoreSavedStore)(options, dispatch, setRestored)
                : setRestored(true);
        }, []);
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
    return { StoreProvider: StoreProvider, useSelector: useSelector, useDispatch: useDispatch, isRestored: isRestored };
};
exports["default"] = createStore;
