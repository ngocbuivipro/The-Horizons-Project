import axios from "../axios.custom.js"

export const getSmtpConfigApi = async () => {
    try {
        const URL_API = '/admin/smtp-config'
        const response = await axios.get(URL_API);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch SMTP config"
        }
    }
}

export const updateMaintenanceStatusApi = async (data) => {
    try {
        const URL_API = '/admin/maintenance'
        const response = await axios.put(URL_API, data);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to update maintenance status"
        }
    }
}
export const updateModulesVisibilityApi = async (data) => {
    try {
        const URL_API = '/admin/modules-header';
        const response = await axios.put(URL_API, data);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to update modules visibility"
        };
    }
};

export const updateSmtpConfigApi = async (data) => {
    try {
        const URL_API = '/admin/smtp-config';
        const response = await axios.put(URL_API, data);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to update SMTP config"
        };
    }
};

// user setting
export const getUserSettingApi = async () => {
    try {
        const URL_API = '/admin/all';
        const response = await axios.get(URL_API);
        return response;
    } catch (err) {
        return {
            success: false,
            message: err?.response?.data?.message || "Failed to fetch user setting"
        }
    }
}

export const updateProcessingFeeApi = async (data) => {
    try {
        const URL_API = '/admin/settings/fee'
        const response = await axios.put(URL_API, data);
        return response;
    } catch (err) {
        return {
            success: false,
            message: err?.response?.data?.message || "Failed to update processing fee"
        }
    }
}

export const contactUsApi = async (data) => {
    try {
        const URL_API = '/contact'
        const response = await axios.post(URL_API, data);
        return response;
    } catch (err) {
        return {
            success: false,
            message: err?.response?.data?.message || "Failed to update processing fee"
        }
    }
}

export const updatePaymentOptionApi = async (data) => {
    try {
        const URL_API = '/admin/setting/payment'
        const response = await axios.put(URL_API, data);
        return response;
    } catch (err) {
        return {
            success: false,
            message: err?.response?.data?.message || "Failed to update processing fee"
        }
    }
}

export const updateAdminAboutPageApi = async (data) => {
    try {
        const URL_API = '/page/about'
        const response = await axios.put(URL_API, data);
        return response;
    } catch (err) {
        return {
            success: false,
            message: err?.response?.data?.message || "Failed to update admin about page"
        }
    }
}

export const getAdminAboutPageApi = async () => {
    try {
        const URL_API = '/page/about'
        const response = await axios.get(URL_API);
        return response;
    } catch (err) {
        return {
            success: false,
            message: err?.response?.data?.message || "Failed to update admin about page"
        }
    }
}