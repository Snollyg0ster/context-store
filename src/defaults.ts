import { deepEqual } from './utils';

export const ctxKey = "context-store";

export const internalType = Symbol("internalUpdate");
export const internalStateUpdate = <P extends any>(payload: P) => ({
	type: internalType,
	payload,
});

const deepClone = <T extends any>(obj: T) =>
	JSON.parse(JSON.stringify(obj)) as T;

export const defaultFunctions = {
	deepClone,
	deepEqual,
};