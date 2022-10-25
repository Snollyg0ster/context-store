export interface Action {
  type: string;
  payload?: any;
}

export type ValueOf<T extends {}> = T[keyof T];

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export type ActionTypes<Actions extends Record<string, <T extends string>(type: T) => Action>> = ReturnType<ValueOf<Actions>>;