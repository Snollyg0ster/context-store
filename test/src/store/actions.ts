import { Robot } from "../models";
import { createAction } from "./utils";

const names = {
  increment: "INCREMENT",
  decrement: "DECREMENT",
  addRobot: "ADDROBOT"
} as const;

export const increment = createAction()(names.increment);
export const decrement = createAction()(names.decrement);
export const addRobot = createAction<Robot>()(names.addRobot);
