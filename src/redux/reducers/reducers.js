import { combineReducers } from "redux";
import globalLoading from "./globalLoading";
import auth from "./auth"
const rootReducer = combineReducers({
    globalLoading,
    auth
});

export default rootReducer;