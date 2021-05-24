import { combineReducers } from 'redux';

import topBar from './topBarReducer';
import room from './roomReducer';

export default combineReducers({
    topBar,
    room,
});
