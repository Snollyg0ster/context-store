// Copy-on-write drafts: reducers mutate a proxy, and only the objects on the
// path to a change are shallow-copied. Untouched branches keep their
// references, so a dispatch costs O(changed paths) instead of O(store size).

type DraftState = {
	base: any;
	copy: any | null;
	parent: DraftState | null;
	children: Map<PropertyKey, any>;
	assigned: Set<PropertyKey>;
	proxy: any;
	revoke: () => void;
	finalized: boolean;
	result: any;
};

const DRAFT_STATE = Symbol("draftState");

const isDraftable = (value: any): boolean => {
	if (Array.isArray(value)) return true;
	if (value === null || typeof value !== "object") return false;
	const proto = Object.getPrototypeOf(value);
	return proto === Object.prototype || proto === null;
};

const getState = (value: any): DraftState | undefined =>
	value !== null && typeof value === "object" ? value[DRAFT_STATE] : undefined;

const shallowCopy = (value: any) =>
	Array.isArray(value) ? value.slice() : Object.assign({}, value);

const source = (state: DraftState) => state.copy || state.base;

const markChanged = (state: DraftState) => {
	if (state.copy) return;
	state.copy = shallowCopy(state.base);
	state.parent && markChanged(state.parent);
};

const hasOwn = (obj: any, prop: PropertyKey) =>
	Object.prototype.hasOwnProperty.call(obj, prop);

const createDraft = (
	base: any,
	parent: DraftState | null,
	drafts: DraftState[]
): any => {
	const state = {
		base,
		copy: null,
		parent,
		children: new Map(),
		assigned: new Set(),
		finalized: false,
	} as unknown as DraftState;

	const handler: ProxyHandler<any> = {
		get(_, prop) {
			if (prop === DRAFT_STATE) return state;
			const src = source(state);
			const value = src[prop];
			if (!hasOwn(src, prop) || value !== state.base[prop] || !isDraftable(value)) {
				return value;
			}
			let child = state.children.get(prop);
			if (!child) {
				child = createDraft(value, state, drafts);
				state.children.set(prop, child);
			}
			return child;
		},
		set(_, prop, value) {
			if (!state.copy) {
				const current = state.base[prop];
				if (
					(Object.is(current, value) && (value !== undefined || hasOwn(state.base, prop))) ||
					(value !== undefined && state.children.get(prop) === value)
				) {
					return true;
				}
				markChanged(state);
			}
			state.copy[prop] = value;
			state.assigned.add(prop);
			return true;
		},
		deleteProperty(_, prop) {
			if (!hasOwn(source(state), prop)) return true;
			markChanged(state);
			delete state.copy[prop];
			state.assigned.delete(prop);
			return true;
		},
		has(_, prop) {
			return prop in source(state);
		},
		ownKeys() {
			return Reflect.ownKeys(source(state));
		},
		getOwnPropertyDescriptor(_, prop) {
			const src = source(state);
			const desc = Reflect.getOwnPropertyDescriptor(src, prop);
			if (!desc) return desc;
			return {
				writable: true,
				configurable: !Array.isArray(src) || prop !== "length",
				enumerable: desc.enumerable,
				value: handler.get!(_, prop, undefined),
			};
		},
		defineProperty() {
			throw new Error("defineProperty is not supported on store drafts");
		},
		getPrototypeOf() {
			return Object.getPrototypeOf(state.base);
		},
		setPrototypeOf() {
			throw new Error("setPrototypeOf is not supported on store drafts");
		},
	};

	const { proxy, revoke } = Proxy.revocable(Array.isArray(base) ? [] : {}, handler);
	state.proxy = proxy;
	state.revoke = revoke;
	drafts.push(state);
	return proxy;
};

// Replaces drafts nested inside a newly created value (e.g. `[...draft.list]`)
// with their final values. Original store objects are never walked.
const finalizeNew = (value: any, seen: Set<any>): any => {
	const state = getState(value);
	if (state) return finalizeDraft(state, seen);
	if (!isDraftable(value) || seen.has(value)) return value;
	seen.add(value);
	for (const key of Object.keys(value)) {
		const item = value[key];
		const final = finalizeNew(item, seen);
		if (final !== item) value[key] = final;
	}
	return value;
};

const finalizeDraft = (state: DraftState, seen: Set<any>): any => {
	if (state.finalized) return state.result;
	state.finalized = true;
	if (!state.copy) {
		state.result = state.base;
		return state.result;
	}
	const { base, copy } = state;
	state.result = copy;
	//only touched keys are visited, so big untouched arrays/objects cost nothing
	state.children.forEach((child, key) => {
		if (hasOwn(copy, key) && copy[key] === base[key]) {
			copy[key] = finalizeDraft(getState(child)!, seen);
		}
	});
	state.assigned.forEach((key) => {
		if (hasOwn(copy, key)) copy[key] = finalizeNew(copy[key], seen);
	});
	return copy;
};

export const produce = <S>(base: S, recipe: (draft: S) => void): S => {
	if (!isDraftable(base)) {
		recipe(base);
		return base;
	}
	const drafts: DraftState[] = [];
	const root = createDraft(base, null, drafts);
	try {
		recipe(root);
		return finalizeDraft(getState(root)!, new Set());
	} finally {
		drafts.forEach((state) => state.revoke());
	}
};
