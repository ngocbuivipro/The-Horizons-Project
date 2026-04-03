import {createContext, useContext, useMemo} from 'react';
import axios from '../api/axios.custom';

const ApiContext = createContext(null);

/**
 * Custom hook to easily access the API functions.
 * @returns {{getPageContent: function, getHotelBySlug: function, getExchangeRate: function}}
 */
export const useApi = () => {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error('useApi must be used within an ApiProvider');
    }
    return context;
};

/**
 * Creates an "Admin-aware" API client.
 * It automatically adds the Authorization header if an Admin token is found.
 */
export const createApiClient = () => {
    const accessToken = localStorage.getItem("accessToken");
    const config = {};
    if (accessToken) {
        config.headers = { Authorization: `Bearer ${accessToken}` };
    }

    return {
        getPageContent: async (pageName) => {
            const response = await axios.get(`/page/${pageName}`, config);
            return response;
        },
        getHotelBySlug: async (slug) => {
            const response = await axios.get(`/hotels/${slug}`, config);
            return response;
        },
        getExchangeRate: async () =>{
            const response = await axios.get(`/rates`, config);
            return response;
        }
    };
};

export const ApiProvider = ({ children }) => {
    // Sử dụng useMemo để khởi tạo api client.
    // Lưu ý: Nếu token thay đổi (đăng nhập/đăng xuất), bạn có thể cần cơ chế reload lại provider này.
    const api = useMemo(() => createApiClient(), []);

    return (
        <ApiContext.Provider value={api}>
            {children}
        </ApiContext.Provider>
    );
};

export default ApiContext;