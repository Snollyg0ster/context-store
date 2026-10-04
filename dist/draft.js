"use strict";
// Copy-on-write drafts: reducers mutate a proxy, and only the objects on the
// path to a change are shallow-copied. Untouched branches keep their
// references, so a dispatch costs O(changed paths) instead of O(store size).
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
exports.produce = void 0;
var DRAFT_STATE = Symbol("draftState");
var isDraftable = function (value) {
    if (Array.isArray(value))
        return true;
    if (value === null || typeof value !== "object")
        return false;
    var proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
};
var getState = function (value) {
    return value !== null && typeof value === "object" ? value[DRAFT_STATE] : undefined;
};
var shallowCopy = function (value) {
    return Array.isArray(value) ? value.slice() : Object.assign({}, value);
};
var source = function (state) { return state.copy || state.base; };
var markChanged = function (state) {
    if (state.copy)
        return;
    state.copy = shallowCopy(state.base);
    state.parent && markChanged(state.parent);
};
var hasOwn = function (obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
};
var createDraft = function (base, parent, drafts) {
    var state = {
        base: base,
        copy: null,
        parent: parent,
        children: new Map(),
        assigned: new Set(),
        finalized: false
    };
    var handler = {
        get: function (_, prop) {
            if (prop === DRAFT_STATE)
                return state;
            var src = source(state);
            var value = src[prop];
            if (!hasOwn(src, prop) || value !== state.base[prop] || !isDraftable(value)) {
                return value;
            }
            var child = state.children.get(prop);
            if (!child) {
                child = createDraft(value, state, drafts);
                state.children.set(prop, child);
            }
            return child;
        },
        set: function (_, prop, value) {
            if (!state.copy) {
                var current = state.base[prop];
                if ((Object.is(current, value) && (value !== undefined || hasOwn(state.base, prop))) ||
                    (value !== undefined && state.children.get(prop) === value)) {
                    return true;
                }
                markChanged(state);
            }
            state.copy[prop] = value;
            state.assigned.add(prop);
            return true;
        },
        deleteProperty: function (_, prop) {
            if (!hasOwn(source(state), prop))
                return true;
            markChanged(state);
            delete state.copy[prop];
            state.assigned["delete"](prop);
            return true;
        },
        has: function (_, prop) {
            return prop in source(state);
        },
        ownKeys: function () {
            return Reflect.ownKeys(source(state));
        },
        getOwnPropertyDescriptor: function (_, prop) {
            var src = source(state);
            var desc = Reflect.getOwnPropertyDescriptor(src, prop);
            if (!desc)
                return desc;
            return {
                writable: true,
                configurable: !Array.isArray(src) || prop !== "length",
                enumerable: desc.enumerable,
                value: handler.get(_, prop, undefined)
            };
        },
        defineProperty: function () {
            throw new Error("defineProperty is not supported on store drafts");
        },
        getPrototypeOf: function () {
            return Object.getPrototypeOf(state.base);
        },
        setPrototypeOf: function () {
            throw new Error("setPrototypeOf is not supported on store drafts");
        }
    };
    var _a = Proxy.revocable(Array.isArray(base) ? [] : {}, handler), proxy = _a.proxy, revoke = _a.revoke;
    state.proxy = proxy;
    state.revoke = revoke;
    drafts.push(state);
    return proxy;
};
// Replaces drafts nested inside a newly created value (e.g. `[...draft.list]`)
// with their final values. Original store objects are never walked.
var finalizeNew = function (value, seen) {
    var e_1, _a;
    var state = getState(value);
    if (state)
        return finalizeDraft(state, seen);
    if (!isDraftable(value) || seen.has(value))
        return value;
    seen.add(value);
    try {
        for (var _b = __values(Object.keys(value)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var key = _c.value;
            var item = value[key];
            var final = finalizeNew(item, seen);
            if (final !== item)
                value[key] = final;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return value;
};
var finalizeDraft = function (state, seen) {
    if (state.finalized)
        return state.result;
    state.finalized = true;
    if (!state.copy) {
        state.result = state.base;
        return state.result;
    }
    var base = state.base, copy = state.copy;
    state.result = copy;
    //only touched keys are visited, so big untouched arrays/objects cost nothing
    state.children.forEach(function (child, key) {
        if (hasOwn(copy, key) && copy[key] === base[key]) {
            copy[key] = finalizeDraft(getState(child), seen);
        }
    });
    state.assigned.forEach(function (key) {
        if (hasOwn(copy, key))
            copy[key] = finalizeNew(copy[key], seen);
    });
    return copy;
};
var produce = function (base, recipe) {
    if (!isDraftable(base)) {
        recipe(base);
        return base;
    }
    var drafts = [];
    var root = createDraft(base, null, drafts);
    try {
        recipe(root);
        return finalizeDraft(getState(root), new Set());
    }
    finally {
        drafts.forEach(function (state) { return state.revoke(); });
    }
};
exports.produce = produce;
