import axios from "axios";

const baseURI = import.meta.env.VITE_BASE_URI;

const instance = axios.create({
    baseURL: baseURI,
    // withCredentials: true, // Tạm thời comment dòng này lại nếu server không yêu cầu cookie
});

instance.interceptors.request.use(function (config) {
    const token = localStorage.getItem("accessToken");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, function (error) {
    return Promise.reject(error);
});

instance.interceptors.response.use(function (response) {
    // Trả về thẳng data để đỡ phải gõ response.data.data ở component
    if(response && response.data) return response.data;
    return response;
}, function (error) {
    return Promise.reject(error);
});

export default instance;