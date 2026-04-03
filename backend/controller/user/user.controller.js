import User from "../../models/user/User.js";
import {generateRandomNumber} from "../../helpers/generateHepler.js"
import {sendMail} from "../../helpers/sendMail.js"
import OtpUser from "../../models/user/OtpUser.js"
import {deleteImg} from "../../utils/cloudinary.util.js"
import {sendOtpToken, sendToken} from "../../helpers/JsonToken.js";
import jwt from 'jsonwebtoken'
import { OAuth2Client } from "google-auth-library";

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management API
 */

export const register = async (req, res, next) => {
    try {


        const {username, email, password, confirmPassword,} = req.body;
        const userEmail = await User.findOne({email});
        const otpEmail = await OtpUser.findOne({email});

        if (userEmail || otpEmail) {
            return res.json({
                success: false,
                message: "Email already exist",
            });
        }
        if (password !== confirmPassword) {
            return res.json({
                success: false,
                message: "Password and Confirm Password must be the same",
            });
        }

        const user = {
            username: username,
            email: email,
            password: password,
        };

        const otp = generateRandomNumber(8)
        const objectOtpUser = {
            otp: otp,
            expireAt: Date.now(),
            username: username,
            email: email,
            password: password,
        }


        try {
            const otpUser = new OtpUser(objectOtpUser)
            await otpUser.save()

            await sendMail({
                email: email,
                subject: "[The Horizons] Please verify your device",
                text: `Hello ${username},\n\nA sign-in attempt requires further verification because we did not recognize your device. To complete the sign-in, enter the verification code below:\n\nVerification code: ${objectOtpUser.otp}\n\nIf you did not attempt to sign in, your password may be compromised. Please take the necessary actions to secure your account.`
            })


            sendOtpToken(otpUser, 200, res)

        } catch (error) {
            console.log(error)
            return res.json({
                success: false,
                message: "token expired",
            })
        }


    } catch (error) {
        return res.json({
            success: false,
            message: "Error in BE",
        });
    }
}

export const checkOtp = async (req, res, next) => {
    try {


        const {otp,} = req.body;
        const {tokenOtp} = req.cookies
        if (!tokenOtp) {
            return res.json({
                success: false,
                message: "OTP has expired. Please request a new one.",
                code: 401
            });
        }
        try {
            const decoded = jwt.verify(tokenOtp, process.env.JWT_SECRET);
            const otpEntity = await OtpUser.findOne({_id: decoded.id});
            if (!otpEntity) {
                return res.json({
                    success: false,
                    message: "OTP has expired. Please request a new one.",
                    code: 401
                });
            }
            if (otpEntity.otp !== otp) {
                return res.json({
                    success: false,
                    message: "Incorrect OTP. Please try again.",
                });
            }
            const user = new User({
                username: otpEntity?.username,
                email: otpEntity?.email,
                password: otpEntity?.password,
                avatar: otpEntity?.avatar
            })
            await user.save()
            // Xóa bản ghi OTP sau khi đã dùng
            await OtpUser.findByIdAndDelete(otpEntity._id);
            // Xóa cookie tokenOtp
            res.clearCookie('tokenOtp');
            return res.json({
                success: true,
                message: "Your account has been successfully created!",
            });

        } catch (error) {
            console.log(error)
            return res.json({
                success: false,
                message: "Token expired",
            });
        }


    } catch (error) {
        console.log(error)
        return res.json({
            success: false,
            message: "Error in BE",
        });
    }
}

export const updateUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({success: false, message: "No User found with id " + req.params.id});
        }

        // Whitelist fields that can be updated to prevent mass assignment vulnerabilities.
        const {username, email, password} = req.body;

        if (username) user.username = username;
        if (email) user.email = email;

        // Only update the password if a new one is provided and is a non-empty string.
        // This triggers the 'pre-save' hook in the User model to hash the password.
        if (password && typeof password === 'string' && password.length > 0) {
            user.password = password;
        }

        const updatedUser = await user.save();

        res.status(200).json(updatedUser);
    } catch (error) {
        // Handle potential validation errors, like a duplicate email.
        if (error.code === 11000) {
            return res.status(400).json({success: false, message: "Email is already in use."});
        }
        next(error);
    }
}

export const deleteUser = async (req, res, next) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id) // return updated document
        if (!deletedUser) {
            res.status(404).json({message: "No User found with id " + req.params.id})
            return;
        }
        res.status(200).json(deletedUser);
    } catch (err) {
        next(err);
    }
}

export const getUser = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            user: req.user,
        });
    } catch (error) {
        return res.json({
            success: false,
            message: "Error in BE"
        })
    }
}

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
}

export const login = async (req, res, next) => {
    try {

        const {email, password} = req.body;
        // Explicitly select the password. It's a security best practice to set `select: false`
        // on the password field in the Mongoose schema, so it must be explicitly requested for comparison.
        const user = await User.findOne({email}).select('+password');

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid username or password. Please try again."
            });
        }

        // The error `Illegal arguments: string, object` from the stack trace indicates
        // that `user.password` is an object, not a string hash. This is likely a data
        // integrity issue, but this check will prevent the application from crashing.
        if (typeof user.password !== 'string') {
            console.error(`Authentication failed for user '${email}': password in database is not a string.`);
            return res.status(500).json({
                success: false,
                message: "An internal server error occurred during authentication."
            });
        }

        const isPass = await user.comparePassword(password)

        if (!isPass) {
            return res.status(400).json({
                success: false,
                message: "Invalid username or password. Please try again."
            });
        }
        sendToken(user, 200, res)

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "An error occurred during the login process."
        })
    }
}

export const logout = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to logout",
        });
    }
}

const googleClient = new OAuth2Client(process.env.GG_CLIENT_ID);
export const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Google token is required"
            });
        }

        // Fetch user data using Google Access Token
        const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
        if (!response.ok) {
            throw new Error("Failed to fetch user info from Google");
        }
        const payload = await response.json();
        
        const { email, name, picture } = payload;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Google account has no email"
            });
        }

        let user = await User.findOne({ email });

        // Nếu chưa có user → tạo mới
        if (!user) {
            user = await User.create({
                username: name,
                email: email,
                password: Math.random().toString(36), // password giả để trigger hash
                avatar: picture
            });
        }

        // Dùng hệ thống JWT hiện tại của bạn
        sendToken(user, 200, res);

    } catch (error) {
        console.log("Google login error:", error);
        return res.status(401).json({
            success: false,
            message: "Google authentication failed"
        });
    }
};