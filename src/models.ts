export type Action = {
  type: string;
  payload?: any;
}

export type ValueOf<T extends {}> = T[keyof T];

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export type ParamOfIndex<T extends (...args: any[]) => any, N extends number> = Parameters<T>[N];

export type ActionTypes<T extends Record<string, (...args: any[]) => Action>> = ReturnType<ValueOf<T>>;

export type Options<S> = {
	deepClone?: <T>(obj: T) => T;
	deepEqual?: (x: any, y: any) => boolean;
	persistent?: {
		use?: boolean;
		storeKeys?: (keyof S)[];
		getData: (key: string) => any;
		setData: (key: string, data: any) => void;
	};
};

export type Reducers<S, A> = {
	[key in keyof S]?: (store: S[key], action: A) => S[key] | void;
};