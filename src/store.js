import { legacy_createStore as createStore } from "redux";
import rootReducer from "./redux/reducers/reducers";

const store = createStore(rootReducer);

export default store;