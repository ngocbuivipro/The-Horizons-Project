const initialState = {
    loading: false,
    isLive: true,
    message: "",
    modules: {
        hotel: false,
        tour: false,
        bus: false,
        cruise: false,
        car: true,
        about: false
    },
    credit: false,
    transfer: false,
    payment: { // Thêm default state cho payment fee
        creditCardFeePercent: 0,
        enableCreditCardFee: true
    }
};

export const SystemReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_SYSTEM_STATUS':
            return {
                ...state,
                loading: false,
                isLive: action.payload.isLive ?? state.isLive,
                message: action.payload.message || state.message,

                modules: action.payload.modules || state.modules,

                credit: action.payload.credit ?? state.credit,
                transfer: action.payload.transfer ?? state.transfer,

                // [BỔ SUNG] Cập nhật Payment Fee Object
                payment: action.payload.payment || state.payment
            };
        case 'SYSTEM_STATUS_ERROR':
            return {
                ...state,
                loading: false,
                // Giữ nguyên state cũ nếu lỗi, không reset về default
            };
        default:
            return state;
    }
};