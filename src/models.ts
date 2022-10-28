export type Action = {
  type: string;
  payload?: any;
}

export type ValueOf<T extends {}> = T[keyof T];

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export type ActionTypes<T extends Record<string, (...args: any[]) => Action>> = ReturnType<ValueOf<T>>;