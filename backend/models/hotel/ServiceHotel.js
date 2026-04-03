import mongoose from "mongoose";

const ServicesHotelSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
        },
        icon: {
            type: String,
        },
        description: {
            type: String,
        },
    },
    {timestamps: true}
)

export default mongoose.model("ServicesHotel", ServicesHotelSchema, "services_hotel");
