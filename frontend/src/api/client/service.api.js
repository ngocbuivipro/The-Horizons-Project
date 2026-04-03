import axios from "../axios.custom.js"


/**
 * Searches for cruises based on filter criteria.
 * @param {object} params - Query parameters for filtering (e.g., { location, date, sort, page, limit }).
 * @returns {Promise<object>} The response from the API.
 */
export const searchCruiseApi = async (params) => {
    try {
        const URL_API = '/cruises/search'
        
        // Map frontend filters to backend expected query params
        const queryParams = { ...params };
        
        if (params.search) {
            queryParams.location = params.search;
        } else if (params.city) {
            queryParams.location = params.city;
        }
        
        if (params.priceRange && params.priceRange.length === 2) {
            queryParams.minPrice = params.priceRange[0];
            queryParams.maxPrice = params.priceRange[1];
        }
        
        if (params.amenities && params.amenities.length > 0) {
            queryParams.amenities = params.amenities.join(',');
        }
        
        if (params.durations && params.durations.length > 0) {
            const mapped = params.durations.map(d => {
                if (d === "Day Cruise") return 1;
                const match = d.match(/^(\d+)/);
                return match ? parseInt(match[1]) : 1;
            });
            queryParams.duration = mapped.join(',');
        }

        const response = await axios.get(URL_API, { params: queryParams });
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to search for cruises"
        }
    }
}

/**
 * Fetches the details of a cruise by its slug.
 * @param {string} slug - The slug of the cruise.
 * @returns {Promise<object>} The response from the API.
 */
export const getCruiseDetailApi = async (slug) => {
    try {
        const URL_API = `/cruises/detail/${slug}`;
        const response = await axios.get(URL_API);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch cruise details"
        };
    }
};


// --- ADMIN CRUISE APIS ---

/**
 * Fetches a paginated list of cruises for the Admin dashboard.
 * @param {object} params - Query parameters for filtering and pagination (e.g., { keyword, isActive, page, limit }).
 * @returns {Promise<object>} The response from the API.
 */
export const getAdminCruisesApi = async (params) => {
    try {
        // The backend route is /Admin
        const URL_API = '/cruises/admin';
        const response = await axios.get(URL_API, {params, withCredentials: true});
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch Admin cruises"
        };
    }
};

/**
 * Creates a new cruise.
 * @param {object} data - The data for the new cruise.
 * @returns {Promise<object>} The response from the API.
 */
export const createCruiseApi = async (data) => {
    try {
        const URL_API = '/cruises';
        const response = await axios.post(URL_API, data, {withCredentials: true});
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to create cruise"
        };
    }
};

/**
 * Updates an existing cruise.
 * @param {string} id - The ID of the cruise to update.
 * @param {object} data - The updated data for the cruise.
 * @returns {Promise<object>} The response from the API.
 */
export const updateCruiseApi = async (id, data) => {
    try {
        const URL_API = `/cruises/${id}`;
        const response = await axios.put(URL_API, data, {withCredentials: true});
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to update cruise"
        };
    }
};

/**
 * Deletes a cruise and its associated cabins.
 * @param {string} id - The ID of the cruise to delete.
 * @returns {Promise<object>} The response from the API.
 */
export const deleteCruiseApi = async (id) => {
    try {
        const URL_API = `/cruises/${id}`;
        const response = await axios.delete(URL_API, {withCredentials: true});
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to delete cruise"
        };
    }
};


// --- ADMIN CABIN APIS ---

export const createCabinApi = async (data) => {
    try {
        const URL_API = '/cruises/cabin';
        const response = await axios.post(URL_API, data, {withCredentials: true});
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to create cabin"
        };
    }
};

export const updateCabinApi = async (id, data) => {
    try {
        const URL_API = `/cruises/cabin/${id}`;
        const response = await axios.put(URL_API, data, {withCredentials: true});
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to update cabin"
        };
    }
};

export const deleteCabinApi = async (id) => {
    try {
        const URL_API = `/cruises/cabin/${id}`;
        const response = await axios.delete(URL_API, {withCredentials: true});
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to delete cabin"
        };
    }
};

export const getCruiseTypesApi = async () => {
    try {
        const URL_API = '/cruises/types';
        const response = await axios.get(URL_API);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch cruise types"
        };
    }
};

export const getCabinTemplatesApi = async () => {
    try {
        const URL_API = '/cruises/cabin/admin';
        const response = await axios.get(URL_API);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch cruise types"
        };
    }
};

export const calculateBookingCruisePriceApi = async (data) => {
    try {
        const URL_API = '/cruises/calc-price-cruise';
        const response = await axios.post(URL_API, data);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch cruise types"
        };
    }
};

export const calculateBookingTourPriceApi = async (data) => {
    try {
        const URL_API = '/Tour/calc-price-cruise';
        const response = await axios.post(URL_API, data);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch cruise types"
        };
    }
};

