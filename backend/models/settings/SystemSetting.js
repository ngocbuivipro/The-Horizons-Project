// models/SystemSetting.js
import mongoose from "mongoose";

const systemSetting = new mongoose.Schema({
    key: { type: String, required: true, unique: true, default: 'site_config' }, // Ví dụ: 'site_config'
    isLive: { type: Boolean, default: true },
    maintenanceMessage: { type: String, default: "The system is maintain, please try again later." },
    modules: {
        bus: { type: Boolean, default: true },
        hotel: { type: Boolean, default: true },
        tour: { type: Boolean, default: true },
        about: { type: Boolean, default: true },
        cruise: {type: Boolean, default: true},
        car: {type: Boolean, default: true}
    },
    payment:{
        creditCardFeePercent: {
            type: Number,
            default: 3
        },
        enableCreditCardFee:{
            type: Boolean,
            default: true
        }
    },
    credit:{
        type: Boolean,
        default: true
    },
    transfer:{
        type: Boolean,
        default: true
    }
});

export default mongoose.model('SystemSetting', systemSetting, "system_setting");
