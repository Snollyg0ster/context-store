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
	ParamOfIndex,
	Reducers,
	ValueOf,
} from "./models";
import { defaultFunctions, restoreSavedStore } from "./utils";

const createStore = <S extends Record<string, any>, A extends Action>(
	initState: S,
	reducer: ((store: S, action: A) => S | void) | Reducers<S, A>,
	options?: Options<S>
) => {
	const deepClone = options?.deepClone || defaultFunctions.deepClone;
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
	let prevStore: any = initState;

	type Reducer = typeof reducer;
	// type ReducersActions = Reducer extends (...args: any[]) => any
	// 	? ParamOfIndex<Reducer, 1>
	// 	: ParamOfIndex<Exclude<ValueOf<Reducer>, undefined>, 1>;

	let store = initState;

	//trigger useSelector listeners if listener returned value has changed, after reducer change the store
	const middlewareReducer = (action: A) => {
		const newStore = deepClone(store);
		let returnedStore: Partial<S> | void = {};

		//@ts-ignore
		if (action.type === internalType) {
			returnedStore = action.payload;
		} else if (typeof reducer === "function") {
			returnedStore = reducer(newStore, action);
		} else {
			Object.entries(reducer).forEach((prop) => {
				const [key, reduce] = prop as Entries<typeof reducer>; // @ts-ignore
				const result = reduce(newStore[key], action);
				if (result) {
					// @ts-ignore
					returnedStore[key] = result;
				}
			});
		} // @ts-ignore
		Object.assign(newStore, returnedStore);

		for (const { selector, callback } of listeners.values()) {
			const prev = selector(prevStore);
			const curr = selector(newStore);
			if (!deepEqual(prev, curr)) {
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
					// @ts-ignore
					options.persistent.setData(ctxKey + "-" + key, newStore[key]);
				});
			} else {
				options.persistent.setData(ctxKey, newStore);
			}
		}

		prevStore = newStore;
		store = newStore;
	};

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
			saveStoreChanges && restoreSavedStore(options, dispatch);
		}, []);

		return createElement(Store.Provider, { value: contextValue, children });
	};

	const useSelector = <T>(selector: (state: S) => T): T => {
		const isProviderChild = useContext(Store);
		const [value, setValue] = useState(selector(prevStore));

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

	return { StoreProvider, useSelector, useDispatch };
};

export default createStore;
