import React from 'react';
import { FaEdit } from 'react-icons/fa';

const BookingRequest = ({ request, setRequest, placeholder }) => {
    return (
        <div className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FaEdit className="text-blue-500" /> Special Requests
            </h2>
            <p className="text-sm text-gray-500">
                Please let us know if you have any special requirements. We will try our best to accommodate your needs.
            </p>
            <textarea
                rows={4}
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-gray-700"
                placeholder={placeholder || "E.g., Dietary restrictions, accessibility needs, late check-in, etc."}
            />
        </div>
    );
};

export default BookingRequest;