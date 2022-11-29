import { StoreType } from "./models";

const initialState: StoreType = {
  game: {
    count: 0,
    robots: [
      {
        name: "Toy robot",
        power: 1
      },
      {
        name: "r2d2",
        power: 5
      },
      {
        name: "C-3PO",
        power: 10
      }
    ],
    army: {},
    power: 1
  },
  extraConfig: {
    spaceLeft: 0,
    level: 0,
    name: "inregistred player"
  }
};

export default initialState;
