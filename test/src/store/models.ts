import { Robot } from "../models";

export interface StoreType {
  game: {
    count: number;
    robots: Robot[];
    army: Record<string, Robot[]>;
    power: number;
  };
  extraConfig: {
    spaceLeft: number;
    level: number;
    name: string;
  };
}

export type Action = {
  type: string;
  payload?: any;
};

export type ValueOf<T extends {}> = T[keyof T];

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export type ParamOfIndex<
  T extends (...args: any[]) => any,
  N extends number
> = Parameters<T>[N];

export type ActionTypes<
  T extends Record<string, (...args: any[]) => Action>
> = ReturnType<ValueOf<T>>;
