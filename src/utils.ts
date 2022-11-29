import { ctxKey, internalStateUpdate } from "./defaults";
import { Options } from "./models";

export const createAction =
	<P = undefined>() =>
	<T extends string>(type: T) => {
		return ((payload: P) => {
			return {
				type,
				payload,
			};
		}) as P extends undefined
			? () => { type: T }
			: (payload: P) => { type: T; payload: P };
	};

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

export const restoreSavedStore = <S extends any>(
	options: Options<S>,
	dispatch: (action: any) => any
) => {
	if (!options?.persistent) {
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
			});
	} else {
		(async () => {
			const result = await persistent.getData(ctxKey);
			return result;
		})().then((restoredStore) => {
			//@ts-ignore
			restoredStore && dispatch(internalStateUpdate(restoredStore));
		});
	}
};
