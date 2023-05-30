import { Dispatch, useEffect, useState } from "react";
import { ctxKey, internalStateUpdate } from "./defaults";
import { Options } from "./models";

export function createAction(): <T extends string>(type: T) => () => { type: T }
export function createAction<P extends any>(): <T extends string>(type: T) => (payload: P) => { type: T; payload: P }
export function createAction() {
	return <T extends string>(type: T) => (payload?: any) => ({payload, type});
}

export var deepEqual = function (x: any, y: any) {
	if (x === y) {
		return true;
	} else if (
		typeof x === "object" &&
		x != null &&
		typeof y === "object" &&
		y != null
	) {
		if (Object.keys(x).length !== Object.keys(y).length) return false;

		for (var prop in x) {
			if (y.hasOwnProperty(prop)) {
				if (!deepEqual(x[prop], y[prop])) return false;
			} else return false;
		}

		return true;
	} else return false;
};

const deepClone = <T extends any>(obj: T) =>
	JSON.parse(JSON.stringify(obj)) as T;

export const defaultFunctions = {
	deepClone,
	deepEqual,
};

export const restoreSavedStore = <S extends any>(
	options: Options<S>,
	dispatch: (action: any) => any,
	setRestored: (state: boolean) => void
) => {
	if (!options?.persistent) {
		setRestored(true);
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
				);
				dispatch(internalStateUpdate(restoredStoreParts));
				setRestored(true);
			});
	} else {
		(async () => {
			const result = await persistent.getData(ctxKey);
			return result;
		})().then((restoredStore) => {
			//@ts-ignore
			if (restoredStore) {
				dispatch(internalStateUpdate(restoredStore));
			}
			setRestored(true);
		});
	}
};

export const getIsRestored = () => {
	let restored = false;
	let restoredHooksStateAction = new Set<
		Dispatch<React.SetStateAction<boolean>>
	>();
	const setRestored = (state: boolean) => {
		Array.from(restoredHooksStateAction).forEach((setState) => setState(state));
		restored = state;
	};

	const isRestored = () => {
		const [isReady, setIsReady] = useState(restored);

		useEffect(() => {
			restoredHooksStateAction.add(setIsReady);
			() => restoredHooksStateAction.delete(setIsReady);
		}, []);

		return isReady;
	};

	return { setRestored, isRestored };
};
