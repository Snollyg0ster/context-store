import {
  createContext,
  createElement,
  Dispatch,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState
} from "react";
import { Action, Entries, ParamOfIndex, ValueOf } from "./models";
import { deepEqual } from "./utils";

const ctxKey = "context-store";
const internalType = Symbol("internalUpdate");
const internalStateUpdate = <P extends any>(payload: P) => ({
  type: internalType,
  payload
});

const deepClone = <T extends any>(obj: T) =>
  JSON.parse(JSON.stringify(obj)) as T;
const defaultFunctions = {
  deepClone,
  deepEqual
};

type Options<S> = {
  deepClone?: <T>(obj: T) => T;
  deepEqual?: (x: any, y: any) => boolean;
  persistent?: {
    use?: boolean;
    storeKeys?: (keyof S)[];
    getData: (key: string) => any;
    setData: (key: string, data: any) => void;
  };
};

type Reducers<S, A> = {
  [key in keyof S]?: (store: S[key], action: A & Action) => S[key] | void;
};

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

  type ReducersActions = typeof reducer extends (...args: any[]) => any
    ? ParamOfIndex<typeof reducer, 1>
    : ParamOfIndex<Exclude<ValueOf<typeof reducer>, undefined>, 1>;

  let store = initState;

  //trigger useSelector listeners if listener returned value has changed, after reducer change the store
  const middlewareReducer = (action: ReducersActions) => {
    const newStore = deepClone(store);
    let returnedStore: Partial<S> | void = {};

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
      saveStoreChanges &&
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
    dispatch: draftDispatch
  });

  const dispatch = middlewareReducer;

  const StoreProvider = (props: PropsWithChildren<{}>) => {
    const { children } = props;

    const contextValue = useMemo(() => ({ dispatch }), []);

    useEffect(() => {
      if (!saveStoreChanges || !options?.persistent) {
        return;
      }
      const { persistent } = options;
      if (persistent.storeKeys) {
        const storeKeys = persistent.storeKeys as string[];
        const storeParts = storeKeys.map((key) =>
          persistent.getData(ctxKey + "-" + key)
        );
        Promise.allSettled(storeParts)
          .then(
            (results) =>
              results
                .map((res, i) =>
                  res.status === "fulfilled" && res?.value
                    ? [storeKeys[i], res.value]
                    : undefined
                )
                .filter(Boolean) as [string, any]
          )
          .then((results) => {
            const restoredStoreParts = results.reduce(
              (acc, [key, value]) => ({ ...acc, [key]: value }),
              {}
            ); //@ts-ignore
            dispatch(internalStateUpdate(restoredStoreParts));
          });
      } else {
        (async () => {
          const result = await persistent.getData(ctxKey);
          return result;
        })().then((restoredStore) => {
          //@ts-ignore
          restoredStore && dispatch(internalStateUpdate(restoredStore));
        });
      }
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
        callback: setValue
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
