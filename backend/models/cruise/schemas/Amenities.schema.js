import mongoose from "mongoose";

// Cấu trúc: Một nhóm chứa danh sách các tiện ích
// Ví dụ: { group: "Entertainment", items: ["Live Show", "Casino"] }
const AmenityGroupSchema = new mongoose.Schema({
    group: {
        type: String,
        required: true,
        trim: true
    },
    items: [{
        type: String,
        trim: true
    }]
}, { _id: false }); // Không cần _id cho sub-doc này để nhẹ DB

export default AmenityGroupSchema;
