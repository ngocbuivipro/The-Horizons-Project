import dotenv from "dotenv";
dotenv.config();

export const SERVER_API_URL = process.env.SERVER_API_URL || "http://localhost:8080";
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
export const HOST = process.env.ONEPAY_HOST

// OnePay Configuration
export const ONEPAY_CONFIG = {
    PAYGATE_URL: process.env.ONEPAY_PAYGATE_URL,
    QUERY_DR_URL: process.env.ONEPAY_QUERY_DR_URL,
    MERCHANT_ID: process.env.ONEPAY_MERCHANT_ID,
    ACCESS_CODE: process.env.ONEPAY_ACCESS_CODE,
    HASH_CODE: process.env.ONEPAY_HASH_CODE,
    QUERY_USER: process.env.ONEPAY_QUERY_USER,      // User cho QueryDR
    QUERY_PASSWORD: process.env.ONEPAY_QUERY_PASSWORD, // Pass cho QueryDR

};

// URL Callback & Return (Server-to-Server & Client Redirect)
export const ONEPAY_ROUTES = {
    RETURN_URL: `${SERVER_API_URL}/api/payment/onepay/return`,
    CALLBACK_URL: `${SERVER_API_URL}/api/payment/onepay/ipn`, // IPN cần public domain hoặc ngrok
};