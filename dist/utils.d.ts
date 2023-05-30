import { Options } from "./models";
export declare function createAction(): <T extends string>(type: T) => () => {
    type: T;
};
export declare function createAction<P extends any>(): <T extends string>(type: T) => (payload: P) => {
    type: T;
    payload: P;
};
export declare var deepEqual: (x: any, y: any) => boolean;
export declare const defaultFunctions: {
    deepClone: <T extends unknown>(obj: T) => T;
    deepEqual: (x: any, y: any) => boolean;
};
export declare const restoreSavedStore: <S extends unknown>(options: Options<S>, dispatch: (action: any) => any, setRestored: (state: boolean) => void) => void;
export declare const getIsRestored: () => {
    setRestored: (state: boolean) => void;
    isRestored: () => boolean;
};
