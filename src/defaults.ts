export const ctxKey = "context-store";

export const internalType = Symbol("internalUpdate");
export const internalStateUpdate = <P extends any>(payload: P) => ({
	type: internalType,
	payload,
});