export declare const ctxKey = "context-store";
export declare const internalType: unique symbol;
export declare const internalStateUpdate: <P extends unknown>(payload: P) => {
    type: symbol;
    payload: P;
};
