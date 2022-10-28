import { createAction } from './../src/utils';
import { Man } from './models';

const actionTypes = {
  mamaImKillAMan: 'MAMAIMKILLAMAN',
  breakMath: 'BREAKMATH',
} as const;

export const mamaImKillAMan = createAction<Man>()(actionTypes.mamaImKillAMan);
export const breakMath = createAction<[string, number]>()(actionTypes.breakMath);
export const breakMaths = createAction()(actionTypes.breakMath);