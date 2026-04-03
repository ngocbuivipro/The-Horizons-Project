import mongoose  from "mongoose";

const CitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image:{
        type: String,
        required: true
    },
    slug:{
        type: String,
        lowercase: true
    }
}, {timestamps: true})

export default mongoose.model("City", CitySchema)