import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import rootReducer from './Reducers';

let store = null;
export default function configureStore() {
    if (!store)
        store = createStore(rootReducer, applyMiddleware(thunkMiddleware));
    return store;
}
