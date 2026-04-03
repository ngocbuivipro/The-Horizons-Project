import { getSystemStatusApi } from "../../api/client/api.js"; // Cập nhật đường dẫn đúng với project của bạn

export const fetchSystemStatus = () => {
    return async (dispatch) => {
        try {
            const res = await getSystemStatusApi();

            if (res.success || res.data) {
                dispatch({
                    type: 'SET_SYSTEM_STATUS',
                    payload: {
                        isLive: res.data ? res.data.isLive : res.isLive,
                        message: res.data ? res.data.message : res.message,
                        modules: res.modules || (res.data && res.data.modules) || {}
                    }
                });
            }
        } catch (error) {
            console.error("System status check failed - Using default configuration", error);
            dispatch({ type: 'SYSTEM_STATUS_ERROR' });
        }
    };
};