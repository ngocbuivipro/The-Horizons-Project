// These values should align with the backend `TRANSFER_TYPE` constants in `/backend/constants/car.constant.js`.
export const BACKEND_TRANSFER_TYPE = {
    ONE_WAY: 'One-way',
    RETURN: 'Return',
    HOURLY: 'By the hour'
};

// These are the slugs used in the URL search parameters for the service type.
export const URL_SERVICE_TYPE = {
    TRANSFERS: 'transfers', // Corresponds to one-way or return
    HOURLY: 'hourly',
};

// These are the slugs used in the URL search parameters for the trip type.
export const URL_TRIP_TYPE = {
    ONE_WAY: 'one_way',
    RETURN: 'return',
};