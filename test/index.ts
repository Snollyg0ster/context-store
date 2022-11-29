import { Action } from './../dist/models.d';
import { ActionTypes } from './../src/models';
import createStore from '../src/index';
import * as actions from './actions';
import { Man } from './models';

type Actions = ActionTypes<typeof actions>;
type RedActions = {
  type: "MAMAIMKILLAMAN";
  payload: Man;
}
type Df = {
  type: "BREAKMATH";
  payload: [string, number];
};

createStore({
  state: {
    first: 1,
  },
  stateTwo: {
    second: 2
  }
},
{
  state: (state, action: RedActions) => {
    
  },
  // stateTwo: (state, action: Df) => {

  // }
}).useDispatch

createStore({
  state: {
    first: 1,
  },
  stateTwo: {
    second: 2
  }
},
(state, action: RedActions | Df) => {
    state; action;
}).useDispatch()