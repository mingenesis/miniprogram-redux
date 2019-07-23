import * as Redux from 'redux';
import * as Reselect from 'reselect';
import selector from './selector';
import { Provider, getStore, dispatch } from './ReduxContext';
import shallowEqual from './utils/shallowEqual';

export {
  Redux,
  Reselect,
  selector,
  Provider,
  getStore,
  dispatch,
  shallowEqual,
};
