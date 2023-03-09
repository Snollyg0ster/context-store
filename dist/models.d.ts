export declare type Action = {
    type: string;
    payload?: any;
};
export declare type ValueOf<T extends {}> = T[keyof T];
export declare type Entries<T> = {
    [K in keyof T]: [K, T[K]];
}[keyof T][];
export declare type ParamOfIndex<T extends (...args: any[]) => any, N extends number> = Parameters<T>[N];
export declare type ActionTypes<T extends Record<string, (...args: any[]) => Action>> = ReturnType<ValueOf<T>>;
export declare type Options<S> = {
    deepClone?: <T>(obj: T) => T;
    deepEqual?: (x: any, y: any) => boolean;
    persistent?: {
        use?: boolean;
        storeKeys?: (keyof S)[];
        getData: (key: string) => any;
        setData: (key: string, data: any) => void;
    };
};
export declare type Reducers<S, A> = {
    [key in keyof S]?: (store: S[key], action: A) => S[key] | void;
};
