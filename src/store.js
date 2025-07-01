import { legacy_createStore as createStore } from "redux";
import rootReducer from "./redux/reducers/reducers";
import { composeWithDevTools } from 'redux-devtools-extension';

const store = createStore(rootReducer, composeWithDevTools());

export default store;