import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { JWT_EXPIRE, JWT_SECRET } from "../config/env.js";


dotenv.config();


export const createActiveToken = (data) => {
  return jwt.sign(data, JWT_SECRET, {
    expiresIn: JWT_EXPIRE
  })
}

export const sendToken = (data, statusCode, res) => {


  data.password = "";
  const token = data.getJwtToken()

  res.status(statusCode).json({
    success: true,
    data,
    token,
  });
}


export const sendOtpToken = (data, statusCode, res) => {
  const token = data.getJwtToken();

  const options = {
    expires: new Date(Date.now() + 5 * 60 * 1000), // 5 phút
    httpOnly: true,
    sameSite: 'lax',
  };

  res.status(statusCode).cookie('tokenOtp', token, options).json({
    success: true,
    message: "OTP sent successfully"
  });
}



export const sendAdminToken = (data, statusCode, res) => {

  const token = data.getJwtToken()
  res.status(statusCode).json({
    success: true,
    data: {
      username: data.username,
      role: data.role,
    },
    token,
    message: "Admin login successfully"
  });
}