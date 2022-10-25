import { Dispatch, PropsWithChildren } from "react";
import { Action } from "./models";
declare type Reducers<S, A extends Action> = {
    [key in keyof S]?: (store: S[key], action: A) => S[key] | void;
};
declare const createStore: <S, A extends Action>(initState: S, reducer: Reducers<S, A> | ((store: S, action: A) => void | S), options?: {
    deepClone?: (<T>(obj: T) => T) | undefined;
    deepEqual?: ((x: any, y: any) => boolean) | undefined;
} | undefined) => {
    StoreProvider: (props: PropsWithChildren<{}>) => import("react").FunctionComponentElement<import("react").ProviderProps<{
        dispatch: Dispatch<A>;
    }>>;
    useSelector: <T_1>(selector: (state: S) => T_1) => T_1;
    useDispatch: () => Dispatch<A>;
};
export default createStore;
