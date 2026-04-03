import axios from "../axios.custom.js";

/**
 * Creates a new booking for any service type (Hotel, Tour, Bus, Cruise, Car).
 * @param {object} bookingData - The complete data for the new booking.
 * @returns {Promise<object>} The response from the API.
 */
export const createBookingApi = async (bookingData) => {
    try {
        // Note: Assumes a backend route like '/bookings' is created for POST requests.
        const URL_API = '/bookings';
        const response = await axios.post(URL_API, bookingData);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to create booking"
        }
    }
};

/**
 * Retrieves all bookings for a specific user by email.
 * @param {string} email - The user's email address.
 * @returns {Promise<object>} The response from the API.
 */
export const getBookingsByEmailApi = async (email) => {
    try {
        const URL_API = `/bookings/email/${email}`;
        const response = await axios.get(URL_API);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch bookings"
        }
    }
};

/**
 * Retrieves a single booking by its ID.
 * @param {string} id - The booking ID.
 * @returns {Promise<object>} The response from the API.
 */
export const getBookingByIdApi = async (id) => {
    try {
        const URL_API = `/bookings/${id}`;
        const response = await axios.get(URL_API);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch booking details"
        }
    }
};