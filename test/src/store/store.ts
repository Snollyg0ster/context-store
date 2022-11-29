import createStore from "@snolly/context-store";
import initialState from "./defaults";
import { StoreType } from "./models";
import * as actions from "./actions";
import { ValueOf } from "./models";

type ActionTypes = ReturnType<ValueOf<typeof actions>>;

export const { StoreProvider, useSelector, useDispatch } = createStore(
  initialState,
  {
    game: (game, action: ActionTypes) => {
      switch (action.type) {
        case "INCREMENT":
          game.count += game.power;
          break;
        case "DECREMENT":
          game.count--;
          break;
        case "ADDROBOT":
          const { payload: robot } = action;
          const { army } = game;
          if (army[robot.name]) {
            army[robot.name] = [robot];
          } else {
            army[robot.name].push(robot);
          }
          break;
      }
    }
  },
  {
    persistent: {
      use: true,
      storeKeys: ["game"],
      setData: (key: string, data: any) =>
        Promise.resolve(localStorage.setItem(key, JSON.stringify(data))),
      getData: (key: string) => {
        const data = localStorage.getItem(key);
        return Promise.resolve(data ? JSON.parse(data) : data);
      }
    }
  }
);

// const commonReducer = (store, action: ReturnType<ValueOf<typeof actions>>) => {
//   switch (action.type) {
//     case "INCREMENT":
//       store.game.count += store.game.power;
//       break;
//     case "DECREMENT":
//       store.game.count--;
//       break;
//     case "ADDROBOT":
//       const { payload: robot } = action;
//       const { army } = store.game;
//       if (army[robot.name]) {
//         army[robot.name] = [robot];
//       } else {
//         army[robot.name].push(robot);
//       }
//       break;
//   }
// }
