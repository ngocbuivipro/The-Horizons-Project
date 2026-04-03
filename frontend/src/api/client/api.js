import axios from "../axios.custom.js"

const registerUser = async (data) => {
    try {
        const URL_LOGIN = '/users/register'
        const response = await axios.post(URL_LOGIN, data, {
            withCredentials: true,
        });
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to register user"
        }
    }
}

const checkTokenOtp = async (data) => {
    try {
        const URL_LOGIN = '/users/check-otp'
        const response = await axios.post(URL_LOGIN, data, { withCredentials: true })
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to verify OTP token"
        }
    }
}

const getUserApi = async () => {
    try {
        const URL_LOGIN = '/users/get-user-verify'
        const response = await axios.get(URL_LOGIN, { withCredentials: true })
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch user data"
        }
    }
}

const loginApi = async (data) => {
    try {
        const URL_LOGIN = '/users/login'
        const response = await axios.post(URL_LOGIN, data, { withCredentials: true })
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to login user"
        }
    }
}

const createAdmin = async (data) => {
    try {
        const URL_LOGIN = '/admin'
        const response = await axios.post(URL_LOGIN, data)
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to create Admin"
        }
    }
}

const loginAdminApi = async (data) => {
    try {
        const URL_LOGIN = '/admin/login'
        const response = await axios.post(URL_LOGIN, data)
        if (response.data) {
            localStorage.setItem('accessToken', response.token)
        }
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to login Admin"
        }
    }
}

const getAdminApi = async () => {
    try {
        const URL_LOGIN = '/admin'
        const response = await axios.get(URL_LOGIN, { withCredentials: true })
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch Admin data"
        }
    }
}

const getAllServicesApi = async () => {
    try {
        const URL_LOGIN = '/hotels/services'
        const response = await axios.get(URL_LOGIN)
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch all services"
        }
    }
}

const getAllFacilitiesApi = async () => {
    try {
        const URL_LOGIN = '/hotels/facilities'
        const response = await axios.get(URL_LOGIN)
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch all facilities"
        }
    }
}

const createServicesApi = async (data) => {
    try {
        const URL_LOGIN = '/hotels/services'
        const response = await axios.post(URL_LOGIN, data)
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to create service"
        }
    }
}

const deleteServicesApi = async (data) => {
    try {
        const URL_LOGIN = '/hotels/services/' + data
        const response = await axios.delete(URL_LOGIN)
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to delete service"
        }
    }
}

const editServicesApi = async (id, data) => {
    try {
        const URL_LOGIN = '/hotels/services/' + id
        const response = await axios.patch(URL_LOGIN, data)
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to update service"
        }
    }
}

const editFacilitiesApi = async (id, data) => {
    try {
        const URL_LOGIN = '/hotels/facilities/' + id
        const response = await axios.patch(URL_LOGIN, data)
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to update facility"
        }
    }
}

const createFacilitiesApi = async (data) => {
    try {
        const URL_LOGIN = '/hotels/facilities'
        const response = await axios.post(URL_LOGIN, data)
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to create facility"
        }
    }
}

const deleteFacilitiesApi = async (data) => {
    try {
        const URL_LOGIN = '/hotels/facilities/' + data
        const response = await axios.delete(URL_LOGIN)
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to delete facility"
        }
    }
}

const uploadByLinkApi = async (data) => {
    try {
        const URL_LOGIN = `/upload/upload-by-link`
        const response = await axios.post(URL_LOGIN, data)
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to upload by link"
        }
    }
}

const uploadByFilesApi = async (data) => {
    try {
        const URL_LOGIN = `/upload/upload-by-files`
        const response = await axios.post(URL_LOGIN, data)
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to upload files"
        }
    }
}

const createHotelApi = async (data) => {
    try {
        const URL_LOGIN = `/hotels`
        const response = await axios.post(URL_LOGIN, data)
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to create Hotel"
        }
    }
}

const deleteHotelApi = async (id) => {
    try {
        const URL_LOGIN = `/hotels/hotel/` + id
        const response = await axios.delete(URL_LOGIN)
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to delete Hotel"
        }
    }
}


const getAllHotelApi = async (params) => { // 1. Nhận biến params
    try {
        const URL_API = `/hotels`;

        const response = await axios.get(URL_API, {
            params: params
        });

        return response;
    } catch (error) {
        return {
            // Trả về toàn bộ payload lỗi từ server để component có thể đọc được
            ...(error?.response?.data || {}),
            success: false,
            message: error?.response?.data?.message || "Failed to fetch all hotels"
        };
    }
}

export const getAdminHotelsApi = async (params) => {
    try {
        // This endpoint is protected by `verifyAdmin` middleware on the backend.
        const URL_API = `/hotels/admin/all`;

        const response = await axios.get(URL_API, {
            params: params, // Pass filters (search, sort, etc.)
            withCredentials: true // Important for Admin authentication
        });

        return response;
    } catch (error) {
        return {
            ...(error?.response?.data || {}),
            success: false,
            message: error?.response?.data?.message || "Failed to fetch Admin hotels"
        };
    }
}


const getAllRoomApi = async () => {
    try {
        const URL_LOGIN = `/rooms`
        const response = await axios.get(URL_LOGIN)
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch all rooms"
        }
    }
}

const updateHotelApi = async (data) => {
    try {
        const URL_LOGIN = `/hotels/hotel`
        // By passing the data object and setting the Content-Type header,
        // we ensure api correctly serializes the payload as JSON. This fixes
        // issues where arrays are misinterpreted as strings by the backend.
        const config = { headers: { 'Content-Type': 'application/json' } };
        const response = await axios.patch(URL_LOGIN, data, config);
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to update Hotel"
        }
    }
}

export const getAllHotelNamesApi = async () => {
    try {
        const URL_API = `/hotels/names`;
        const res = await axios.get(URL_API);
        return res;
    } catch (error) {
        return { success: false, message: error.message };
    }
};

export const getRecommendedHotelsApi = async (city) => {
    try {
        // Pass city as query param if it exists
        const url = city
            ? `/hotels/recommended?city=${city}`
            : `/hotels/recommended`;

        const res = await axios.get(url);
        return res;
    } catch (error) {
        return { success: false, message: error.message };
    }
};

const getHotelDetailApi = async (slug) => {
    try {
        const URL_API = `/hotels/${slug}`;
        const response = await axios.get(URL_API);

        return response;
    } catch (error) {
        // Propagate the full error response for the component to handle
        return {
            ...(error?.response?.data || {}),
            success: false,
            message: error?.response?.data?.message || "Failed to fetch Hotel details"
        };
    }
};

const createRoomApi = async (data) => {
    try {
        const URL_LOGIN = `/rooms`
        const response = await axios.post(URL_LOGIN, data)
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to create room"
        }
    }
}

const deleteRoomApi = async (id, hotelId) => {
    try {
        const URL_LOGIN = `/rooms/room/` + id + "/" + hotelId
        const response = await axios.delete(URL_LOGIN)
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to delete room"
        }
    }
}

const getRoomDetailApi = async (slug) => {
    try {
        const URL_API = `/rooms/${slug}`;
        const response = await axios.get(URL_API);
        return response;
    } catch (error) {
        return {
            // Propagate the full error response for the component to handle
            ...(error?.response?.data || {}),
            success: false,
            message: error?.response?.data?.message || "Failed to fetch room details"
        };
    }
};

const updateRoomApi = async (data, id) => {
    try {
        const URL_LOGIN = `/rooms/room/${id}`
        const response = await axios.patch(URL_LOGIN, data)
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to update room"
        }
    }
}

const getPolicyApi = async (data) => {
    try {
        const URL_LOGIN = `/policies`
        const response = await axios.get(URL_LOGIN, { params: data })
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch policy"
        }
    }
}

const createPolicyApi = async (data) => {
    try {
        const URL_LOGIN = `/policies`
        const response = await axios.post(URL_LOGIN, data)
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to create policy"
        }
    }
}

const deletePolicyApi = async (data) => {
    try {
        const URL_LOGIN = '/policies/policy/' + data
        const response = await axios.delete(URL_LOGIN)
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to delete policy"
        }
    }
}

const editPolicyApi = async (id, data) => {
    try {
        const URL_LOGIN = '/policies/policy/' + id
        const response = await axios.patch(URL_LOGIN, data)
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to update policy"
        }
    }
}

const createBookingHotelPayment = async (data) => {
    try {
        const URL_LOGIN = '/booking'
        const response = await axios.post(URL_LOGIN, data)
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to create OTP payment"
        }
    }
}

const createOder = async (data) => {
    try {
        const response = await axios.post("/booking/order", data);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to create order"
        }
    }
}

const createBookingApi = async (data) => {
    try {
        const URL_CREATE_BOOKING = '/booking';
        const response = await axios.post(URL_CREATE_BOOKING, data);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to create booking"
        };
    }
};

const getBookingApi = async (id) => {
    try {
        const URL_LOGIN = '/booking/' + id
        const response = await axios.get(URL_LOGIN)
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch booking"
        }
    }
}

const updateBookingApi = async (id, data) => {
    try {
        const URL_LOGIN = '/booking/' + id
        const response = await axios.patch(URL_LOGIN, data)
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to update booking"
        }
    }
}

export const calculateBookingPriceApi = async (payload) => {
    // payload: { checkIn, checkOut, roomTypeId }
    const response = await axios.post(`/booking/calculate`, payload);
    return response;
};

export const calculateBookingTourPriceApi = async (payload) => {
    const response = await axios.post(`/tour/calculate-tour`, payload)
    return response;
}

const updateStatusBookingApi = async (id) => {
    try {
        const URL_LOGIN = '/booking/update-status/' + id
        const response = await axios.patch(URL_LOGIN)
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to update booking status"
        }
    }
}

const getBookingByEmailApi = async (email) => {
    try {
        const URL_LOGIN = '/booking/by-email/' + email
        const response = await axios.get(URL_LOGIN)
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch bookings by email"
        }
    }
}

// const getAllBookingApi = async () => {
//     try {
//         const URL_LOGIN = '/booking'
//         const response = await axios.get(URL_LOGIN)
//         return response
//     } catch (error) {
//         return {
//             success: false,
//             message: error?.response?.data?.message || "Failed to fetch all bookings"
//         }
//     }
// }

const getAllBookingApi = async (params) => { // 1. Nhận tham số (params)
    try {
        const URL_API = '/booking'; // Đổi tên biến cho đúng ngữ cảnh

        // 2. Truyền params vào cấu hình của axios
        // axios sẽ tự động chuyển object thành query string: ?page=1&limit=8&isPaid=true
        const response = await axios.get(URL_API, { params: params });

        return response; // 3. Quan trọng: Trả về data (payload) thay vì cả object response của axios
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch bookings"
        };
    }
};

const getPayPalClientApi = async () => {
    try {
        const URL_LOGIN = '/config/paypal'
        const response = await axios.get(URL_LOGIN)
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch PayPal client configuration"
        }
    }
}

const busAdminApi = async (path, method, payload = {}) => {
    try {
        const URL_LOGIN = '/bus/admin/' + path
        const response = await axios[method](URL_LOGIN, payload, { withCredentials: true })
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch bus data"
        }
    }
}


export const createOnePayPayment = async (bookingId) => {
    try {
        const res = await axios.post(`/payment/create-url/${bookingId}`);
        return res;
    } catch (error) {
        console.error("Create Payment Error:", error);
        return {
            success: false,
            message: error?.response?.data?.message || "Lỗi khởi tạo thanh toán"
        };
    }
};

export const checkPaymentStatus = async (bookingId) => {
    try {
        const res = await axios.get(`/payment/status/${bookingId}`);
        return res;
    } catch (error) {
        console.error("Check Status Error:", error);
        return {
            success: false,
            message: error?.response?.data?.message || "Lỗi kiểm tra trạng thái"
        };
    }
};

export const handleLogout = async () => {
    try {
        const URL_LOGOUT = '/admin/logout'; // Corrected endpoint
        const response = await axios.post(URL_LOGOUT, {}, {
            withCredentials: true,
        });
        return response;
    } catch (e) {
        return {
            success: false,
            message: e?.response?.data?.message || "Failed to logout"
        };
    }
}

export const logoutUserApi = async () => {
    try {
        const response = await axios.post('/users/logout');
        return response;
    } catch (e) {
        return {
            success: false,
            message: e?.response?.data?.message || "Failed to logout"
        };
    }
}


export const getHotelBySlugApi = async (slug) => {
    try {
        const URL_API = `/hotels/${slug}`;


        const adminToken = localStorage.getItem("accessToken");

        const config = {};
        if (adminToken) {
            // If it exists, add the Authorization header to the request
            config.headers = {
                Authorization: `Bearer ${adminToken}`
            };
        }

        const response = await axios.get(URL_API, config);
        return response; // Return the data part of the response

    } catch (error) {
        // Propagate the full error response for the component to handle
        return { ...(error?.response?.data || {}), success: false };
    }
};


export const toggleVisibilityHotelApi = async (_id) => {
    try {
        const URL = `hotels/${_id}/visibility`; // Use template literal to insert the ID
        const response = await axios.patch(URL, {}, { // The second argument for patch is data, which is empty here.
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.log("error", error)
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to toggle visibility"
        }
    }
}

export const softDeleteBookingApi = async (id) => {
    try {
        // Matches the route: router.patch("/soft-delete/:id", ...)
        const URL_API = '/booking/soft-delete/' + id;
        const response = await axios.patch(URL_API);
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to move booking to trash"
        };
    }
};

export const hardDeleteBookingApi = async (id) => {
    try {
        // Matches the route: router.delete("/hard-delete/:id", ...)
        const URL_API = '/booking/hard-delete/' + id;
        const response = await axios.delete(URL_API);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to delete booking permanently"
        };
    }
};

export const getAllCouponsApi = async () => {
    try {
        const URL_API = '/admin/coupons';
        const response = await axios.get(URL_API, { withCredentials: true });
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch coupons"
        };
    }
};

export const createCouponApi = async (data) => {
    try {
        const URL_API = '/admin/coupons';
        const response = await axios.post(URL_API, data, { withCredentials: true });
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to create coupon"
        };
    }
};

export const updateCouponApi = async (id, data) => {
    try {
        const URL_API = `/admin/coupons/${id}`;
        const response = await axios.put(URL_API, data, { withCredentials: true });
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to update coupon"
        };
    }
};

export const deleteCouponApi = async (id) => {
    try {
        const URL_API = `/admin/coupons/${id}`;
        const response = await axios.delete(URL_API, { withCredentials: true });
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to delete coupon"
        };
    }
};

export const toggleCouponStatusApi = async (id) => {
    try {
        const URL_API = `/admin/coupons/${id}/toggle`;
        const response = await axios.patch(URL_API, {}, { withCredentials: true });
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to toggle coupon status"
        };
    }
};

export const getSystemStatusApi = async () => {
    try {
        const URL_API = '/public/status';
        const response = await axios.get(URL_API);
        return response;
    } catch (error) {
        return {
            success: false,
            isLive: true,
            message: error?.response?.data?.message || "Failed to check system status"
        };
    }
};

export const createTourApi = async (data) => {
    try {
        const URL_API = '/tour';
        // Map 'photos' từ frontend sang 'images' cho backend
        const payload = { ...data };
        if (payload.photos) {
            payload.images = payload.photos;
        }
        const response = await axios.post(URL_API, payload, { withCredentials: true });
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to create Tour"
        };
    }
};

export const getTourDetailApi = async (slug) => {
    try {
        const URL_API = `/tour/${slug}`;
        const response = await axios.get(URL_API);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch Tour details"
        };
    }
};

export const updateTourApi = async (id, data) => {
    try {
        const URL_API = `/tour/${id}`;
        // Map 'photos' từ frontend sang 'images' cho backend
        const payload = { ...data };
        if (payload.photos) {
            payload.images = payload.photos;
        }
        const response = await axios.put(URL_API, payload, { withCredentials: true });
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to update Tour"
        };
    }
};

export const getAdminToursApi = async (params) => {
    try {
        const URL_API = '/tour/admin/all';
        const response = await axios.get(URL_API, { params, withCredentials: true });
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch Admin tours"
        };
    }
};

export const deleteTourApi = async (id) => {
    try {
        const URL_API = `/tour/${id}`;
        const response = await axios.delete(URL_API, { withCredentials: true });
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to delete Tour"
        };
    }
};

export const toggleVisibilityTourApi = async (id) => {
    try {
        const URL_API = `/tour/${id}/toggle`;
        const response = await axios.patch(URL_API, {}, { withCredentials: true });
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to toggle visibility"
        };
    }
};

export const getAllToursApi = async (params) => {
    try {
        const URL_API = '/tour';
        const response = await axios.get(URL_API, { params });
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch tours"
        };
    }
};

// --- BOARDING POINTS API ---
export const getAllBoardingPointsApi = async (params) => {
    try {
        let URL_API = '/bus/boarding';
        const config = {};

        // Handle case where params is passed as a query string (e.g. "isActive=true")
        if (typeof params === 'string') {
            URL_API += `?${params}`;
        } else {
            config.params = params;
        }

        const response = await axios.get(URL_API, config);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch boarding points"
        };
    }
};

export const createBoardingPointApi = async (data) => {
    try {
        const URL_API = '/bus/boarding';
        const response = await axios.post(URL_API, data, { withCredentials: true });
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to create boarding point"
        };
    }
};

export const updateBoardingPointApi = async (id, data) => {
    try {
        const URL_API = `/bus/boarding/${id}`;
        const response = await axios.put(URL_API, data, { withCredentials: true });
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to update boarding point"
        };
    }
};

export const deleteBoardingPointApi = async (id) => {
    try {
        const URL_API = `/bus/boarding/${id}`;
        const response = await axios.delete(URL_API, { withCredentials: true });
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to delete boarding point"
        };
    }
};

// --- BUS API ---
export const searchBusApi = async (params) => {
    try {
        const URL_API = '/bus/search';
        const response = await axios.get(URL_API, { params });
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to search buses"
        };
    }
};

export const getBusDetailApi = async (id) => {
    try {
        const URL_API = `/bus/detail/${id}`;
        const response = await axios.get(URL_API);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch bus detail"
        };
    }
};

export const getBusSeatLayoutApi = async (id) => {
    try {
        const URL_API = `/bus/seats/${id}`;
        const response = await axios.get(URL_API);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch seat layout"
        };
    }
};

export const getAdminBusesApi = async (params) => {
    try {
        const URL_API = '/bus/admin';
        const response = await axios.get(URL_API, { params, withCredentials: true });
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch Admin buses api "
        };
    }
};

export const createBusApi = async (data) => {
    try {
        const URL_API = '/bus';
        const response = await axios.post(URL_API, data, { withCredentials: true });
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to create bus"
        };
    }
};

export const updateBusApi = async (id, data) => {
    try {
        const URL_API = `/bus/${id}`;
        const response = await axios.put(URL_API, data, { withCredentials: true });
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to update bus"
        };
    }
};

export const deleteBusApi = async (id) => {
    try {
        const URL_API = `/bus/${id}`;
        const response = await axios.delete(URL_API, { withCredentials: true });
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to delete bus"
        };
    }
};

export const toggleBusStatusApi = async (id) => {
    try {
        const URL_API = `/bus/${id}/toggle`;
        const response = await axios.patch(URL_API, {}, { withCredentials: true });
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to toggle bus status"
        };
    }
};

export const calculateBookingBusPriceApi = async (data) => {
    try {
        const URL_API = '/bus/calc-price-bus';
        const response = await axios.post(URL_API, data, { withCredentials: true });
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to calculate price"
        };
    }
};

export const getBusType = async () => {
    try {
        const URL_API = '/bus/types';
        const response = await axios.get(URL_API);
        return response;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to fetch bus types"
        };
    }
};

export const searchAllServiceApi = async (params) => {
    try {
        const URL_API = '/search/global'
        const response = await axios.get(URL_API, { params })
        return response
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to search all services"
        }
    }
}


export {
    registerUser,
    checkTokenOtp,
    getUserApi,
    loginApi,
    createAdmin,
    loginAdminApi,
    getAdminApi,
    getAllServicesApi,
    uploadByLinkApi,
    uploadByFilesApi,
    createHotelApi,
    getAllHotelApi,
    getAllRoomApi,
    getHotelDetailApi,
    createServicesApi,
    deleteHotelApi,
    updateHotelApi,
    getAllFacilitiesApi,
    createFacilitiesApi,
    createRoomApi,
    updateRoomApi,
    getRoomDetailApi,
    getPolicyApi,
    createPolicyApi,
    deleteServicesApi,
    editServicesApi,
    deleteRoomApi,
    deleteFacilitiesApi,
    editFacilitiesApi,
    deletePolicyApi,
    editPolicyApi,
    createBookingHotelPayment,
    createBookingApi,
    getBookingApi,
    updateBookingApi,
    getPayPalClientApi,
    getBookingByEmailApi,
    getAllBookingApi,
    updateStatusBookingApi,
    busAdminApi,
    createOder
}