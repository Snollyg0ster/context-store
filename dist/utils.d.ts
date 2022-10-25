export declare const createAction: <P = undefined>() => <T extends string>(type: T) => P extends undefined ? () => {
    type: T;
} : (payload: P) => {
    type: T;
    payload: P;
};
export declare var deepEqual: (x: any, y: any) => boolean;
