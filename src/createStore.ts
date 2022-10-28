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
import { Action, Entries } from "./models";
import { deepEqual } from "./utils";

const deepClone = (obj: any) => JSON.parse(JSON.stringify(obj));
const defaultFunctions = {
  deepClone,
  deepEqual
};

type Reducers<S, A extends Action> = {
  [key in keyof S]?: (store: S[key], action: A) => S[key] | void;
};

const createStore = <S, A extends Action>(
  initState: S,
  reducer: ((store: S, action: A) => S | void) | Reducers<S, A>,
  options?: {
    deepClone?: <T>(obj: T) => T;
    deepEqual?: (x: any, y: any) => boolean;
    persistent?: {
      use?: boolean;
      storeParts?: keyof S;
      getData: Function;
      setData: Function;
    }
  }
) => {
  const deepClone = options?.deepClone || defaultFunctions.deepClone;
  const deepEqual = options?.deepEqual || defaultFunctions.deepEqual;

  const listeners = new Map<
    symbol,
    {
      selector: (store: S) => any;
      callback: (val: any) => any;
    }
  >();
  let prevStore: any = initState;

  const middlewareReducer = (store: S, action: A) => {
    const newStore = deepClone(store) as typeof store;
    let returnedStore: Partial<S> | void = {};

    if (typeof reducer === "function") {
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
        setTimeout(() => {
          callback(curr);
        });
      }
    }

    prevStore = newStore;
    return newStore;
  };

  const draftDispatch: Dispatch<A> = (action) => { throw Error('You cant use dispatch outside of StoreProvider!')};

  const Store = createContext({
    dispatch: draftDispatch
  });

  const StoreProvider = (props: PropsWithChildren<{}>) => {
    const { children } = props;
    const [, dispatch] = useReducer(middlewareReducer, initState);

    const contextValue = useMemo(() => ({ dispatch }), []);

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
