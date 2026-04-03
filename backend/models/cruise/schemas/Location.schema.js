import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
    city: {type: String, required: true, index: true},
    state: String,
    address: String,
    address1: String,
}, {_id: false}); // _id: false giúp document nhẹ hơn vì không cần ID riêng cho location

export default LocationSchema;
