import axios from "../axios.custom.js"

/**
 * Searches for available car routes based on filter criteria.
 * @param {object} params - Query parameters for filtering (e.g., { origin, destination, date, passengers }).
 * @returns {Promise<object>} The response from the API.
 */
export const searchCarApi = async (params) => {
    try {
        const URL_API = '/cars/search'
        // Pass params so the backend can receive them as req.query
        const response = await axios.get(URL_API, { params });
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to search for cars"
        }
    }
}

/**
 * Gets the details of a specific vehicle.
 * @param {string} id - The ID of the vehicle.
 * @returns {Promise<object>} The response from the API.
 */
export const getCarDetailApi = async (id) => {
    try {
        const URL_API = `/cars/${id}`;
        const response = await axios.get(URL_API);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch vehicle details"
        }
    }
}


// --- ADMIN APIS (VEHICLES) ---

/**
 * [ADMIN] Creates a new car vehicle.
 * @param {object} vehicleData - The data for the new vehicle.
 * @returns {Promise<object>} The response from the API.
 */
export const createCarApi = async (vehicleData) => {
    try {
        const URL_API = '/cars';
        const response = await axios.post(URL_API, vehicleData);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to create vehicle"
        }
    }
}

/**
 * [ADMIN] get an existing car vehicle.
 * @param {string} id - The ID of the vehicle to update.
 * @param {object} vehicleData - The updated data for the vehicle.
 * @returns {Promise<object>} The response from the API.
 */
export const getCarRouteDetailApi = async (id) => {
    try {
        const URL_API = `/cars/route/${id}`;
        const response = await axios.get(URL_API);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to update vehicle"
        }
    }
}

/**
 * [ADMIN] Updates an existing car vehicle.
 * @param {string} id - The ID of the vehicle to update.
 * @param {object} vehicleData - The updated data for the vehicle.
 * @returns {Promise<object>} The response from the API.
 */
export const updateCarApi = async (id, vehicleData) => {
    try {
        const URL_API = `/cars/${id}`;
        const response = await axios.put(URL_API, vehicleData);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to update vehicle"
        }
    }
}

/**
 * [ADMIN] Deletes a car vehicle.
 * @param {string} id - The ID of the vehicle to delete.
 * @returns {Promise<object>} The response from the API.
 */
export const deleteCarApi = async (id) => {
    try {
        const URL_API = `/cars/${id}`;
        const response = await axios.delete(URL_API);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to delete vehicle"
        }
    }
}

/**
 * [ADMIN] Gets a list of all car vehicles.
 * @param {object} [params] - Optional query parameters for pagination, sorting, etc.
 * @returns {Promise<object>} The response from the API.
 */
export const getAllCarsApi = async (params) => {
    try {
        const URL_API = '/cars';
        const response = await axios.get(URL_API, { params });
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch all vehicles"
        }
    }
}


// --- ADMIN APIS (ROUTES) ---

/**
 * [ADMIN] Creates a new car route.
 * @param {object} routeData - The data for the new route.
 * @returns {Promise<object>} The response from the API.
 */
export const createCarRouteApi = async (routeData) => {
    try {
        const URL_API = '/cars/route';
        const response = await axios.post(URL_API, routeData);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to create car route"
        }
    }
}

/**
 * [ADMIN] Updates an existing car route.
 * @param {string} id - The ID of the route to update.
 * @param {object} routeData - The updated data for the route.
 * @returns {Promise<object>} The response from the API.
 */
export const updateCarRouteApi = async (id, routeData) => {
    try {
        const URL_API = `/cars/route/${id}`;
        const response = await axios.put(URL_API, routeData);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to update car route"
        }
    }
}

/**
 * [ADMIN] Deletes a car route.
 * @param {string} id - The ID of the route to delete.
 * @returns {Promise<object>} The response from the API.
 */
export const deleteCarRouteApi = async (id) => {
    try {
        const URL_API = `/cars/route/${id}`;
        const response = await axios.delete(URL_API);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to delete car route"
        }
    }
}

/**
 * [ADMIN] Gets a list of all car routes.
 * @param {object} [params] - Optional query parameters for pagination, sorting, etc.
 * @returns {Promise<object>} The response from the API.
 */
export const getAllCarRoutesApi = async (params) => {
    try {
        const URL_API = '/cars/routes';
        const response = await axios.get(URL_API, { params });
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch all car routes"
        }
    }
}

/**
 * Calculates the booking price for a car transfer.
 * @param {object} bookingData - The data for the booking calculation (carId, transferType, origin, destination, duration, etc.).
 * @returns {Promise<object>} The response from the API.
 */
export const calculateBookingCarPriceApi = async (bookingData) => {
    try {
        // Note: Assumes a backend route like '/bookings/calc-price-car' is created.
        const URL_API = '/cars/calc-price-car';
        const response = await axios.post(URL_API, bookingData);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to calculate car transfer price"
        }
    }
};
