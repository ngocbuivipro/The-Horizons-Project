import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {JWT_EXPIRE, JWT_SECRET} from "../../config/env.js"; // Đảm bảo đường dẫn đúng

const UserSchema = new mongoose.Schema({
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: false,
        },
        googleId: {type: String, required: false},
        phoneNumber: { type: String },
        addresses: [
            {
                country: String,
                city: String,
                address1: String,
                address2: String,
            }
        ],
        role: {
            type: String,
            default: "user",
        },
        avatar: { type: String },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        resetPasswordToken: String,
        resetPasswordTime: Date,
    },
    {timestamps: true}
)

// --- FIX: Sửa lỗi thiếu await và return ---
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    try {
        if(this.password){
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
        next();
    } catch (error) {
        next(error);
    }
});

// jwt token
UserSchema.methods.getJwtToken = function () {
    return jwt.sign({id: this._id}, JWT_SECRET, {
        expiresIn: JWT_EXPIRE,
    });
};

// compare password
UserSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", UserSchema);
