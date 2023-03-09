import { Dispatch, PropsWithChildren } from "react";
import { Action, Options, Reducers } from "./models";
declare const createStore: <S extends Record<string, any>, A extends Action>(initState: S, reducer: Reducers<S, A> | ((store: S, action: A) => void | S), options?: Options<S> | undefined) => {
    StoreProvider: (props: PropsWithChildren<{}>) => import("react").FunctionComponentElement<import("react").ProviderProps<{
        dispatch: Dispatch<A>;
    }>>;
    useSelector: <T>(selector: (state: S) => T) => T;
    useDispatch: () => Dispatch<A>;
    isRestored: () => boolean;
};
export default createStore;
