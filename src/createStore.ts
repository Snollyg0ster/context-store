import {
	createContext,
	createElement,
	Dispatch,
	PropsWithChildren,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { ctxKey, internalType } from "./defaults";
import {
	Action,
	Entries,
	Options,
	Reducers,
} from "./models";
import { produce } from "./draft";
import { defaultFunctions, getIsRestored, restoreSavedStore } from "./utils";

const createStore = <S extends Record<string, any>, A extends Action>(
	initState: S,
	reducer: ((store: S, action: A) => S | void) | Reducers<S, A>,
	options?: Options<S>
) => {
	const deepEqual = options?.deepEqual || defaultFunctions.deepEqual;
	const saveStoreChanges = !!(
		options?.persistent &&
		(!("use" in options.persistent) || options.persistent.use)
	);

	const listeners = new Map<
		symbol,
		{
			selector: (store: S) => any;
			callback: (val: any) => any;
		}
	>();

	let store = initState;

	const applyAction = (draft: S, action: A) => {
		let returnedStore: Partial<S> | void = {};

		//@ts-ignore
		if (action.type === internalType) {
			returnedStore = action.payload;
		} else if (typeof reducer === "function") {
			returnedStore = reducer(draft, action);
		} else {
			Object.entries(reducer).forEach((prop) => {
				const [key, reduce] = prop as Entries<typeof reducer>; // @ts-ignore
				const result = reduce(draft[key], action);
				if (result) {
					// @ts-ignore
					returnedStore[key] = result;
				}
			});
		}
		if (returnedStore && returnedStore !== draft) {
			Object.assign(draft, returnedStore);
		}
	};

	//without a custom deepClone only the changed paths of the store are copied
	const getNextStore = (action: A): S => {
		if (options?.deepClone) {
			const newStore = options.deepClone(store);
			applyAction(newStore, action);
			return newStore;
		}
		return produce(store, (draft) => applyAction(draft, action));
	};

	//trigger useSelector listeners if listener returned value has changed, after reducer change the store
	const middlewareReducer = (action: A) => {
		const prevStore = store;
		const newStore = getNextStore(action);

		if (newStore === prevStore) {
			return;
		}

		store = newStore;

		for (const { selector, callback } of listeners.values()) {
			const prev = selector(prevStore);
			const curr = selector(newStore);
			if (prev !== curr && !deepEqual(prev, curr)) {
				callback(curr);
			}
		}

		if (
			saveStoreChanges && //@ts-ignore
			action.type !== internalType &&
			options.persistent
		) {
			if (options.persistent.storeKeys) {
				options.persistent.storeKeys.forEach((key) => {
					if (newStore[key] !== prevStore[key]) {
						// @ts-ignore
						options.persistent.setData(ctxKey + "-" + key, newStore[key]);
					}
				});
			} else {
				options.persistent.setData(ctxKey, newStore);
			}
		}
	};

	const { isRestored, setRestored } = getIsRestored();

	let draftDispatch: Dispatch<A> = (action) => {
		throw Error("You cant use dispatch outside of StoreProvider!");
	};

	const Store = createContext({
		dispatch: draftDispatch,
	});

	const dispatch = middlewareReducer;

	const StoreProvider = (props: PropsWithChildren<{}>) => {
		const { children } = props;

		const contextValue = useMemo(() => ({ dispatch }), []);

		useEffect(() => {
			saveStoreChanges
				? restoreSavedStore(options, dispatch, setRestored)
				: setRestored(true);
		}, []);

		return createElement(Store.Provider, { value: contextValue, children });
	};

	const useSelector = <T>(selector: (state: S) => T): T => {
		const isProviderChild = useContext(Store);
		const [value, setValue] = useState(() => selector(store));

		useEffect(() => {
			const id = Symbol("listenerId");
			listeners.set(id, {
				selector,
				callback: setValue,
			});
			return () => {
				listeners.delete(id);
			};
		}, []);

		return value;
	};

	const useDispatch = () => useContext(Store).dispatch;

	return { StoreProvider, useSelector, useDispatch, isRestored };
};

export default createStore;
