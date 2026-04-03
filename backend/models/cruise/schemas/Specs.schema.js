import mongoose from "mongoose";

const SpecificationSchema = new mongoose.Schema({
    length: String,
    beam: String,
    weight: String,
    speed: String,
    staffs: Number,
    diningCrew: Number,
}, { _id: false });

export default SpecificationSchema;
