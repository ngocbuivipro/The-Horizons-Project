import { getUserApi } from "../../api/client/api"

export const loadUserAction = () => async (dispatch) => {
    // Only attempt to load if there's a token saved
    const token = localStorage.getItem('accessToken');
    if (!token) {
        dispatch({ type: "LoadUserFail", payload: "No token" });
        return;
    }
    try {
        dispatch({ type: "LoadUserRequest" });
        const data = await getUserApi();
        if (data.success) {
            dispatch({ type: "LoadUserSuccess", payload: data.user });
        } else {
            dispatch({ type: "LoadUserFail", payload: "Login to continue" });
        }
    } catch (error) {
        dispatch({
            type: "LoadUserFail",
            payload: error?.response?.data?.message || "load user error",
        });
    }
};

export const loginUserAction = (data) => async (dispatch) => {
    try {
        dispatch({ type: "LoadUserSuccess", payload: data });
    } catch (error) {
        dispatch({
            type: "LoadUserFail",
            payload: error?.response?.data?.message || "error in login user",
        });
    }
};

export const logoutUserAction = () => async (dispatch) => {
    try {
        dispatch({ type: "LogoutUserSuccess" });
    } catch (error) {
        dispatch({
            type: "LoadUserFail",
            payload: error?.response?.data?.message || "error in logout user",
        });
    }
};