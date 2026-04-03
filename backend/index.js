import express from "express";
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from 'swagger-ui-express';
import { createRequire } from "module";

// Routes Imports
import usersRoute from "./routes/user/user.routes.js";
import serviceHotelRoute from "./routes/services/hotel/service-hotel.routes.js";
import facilityHotel from "./routes/services/hotel/facility-hotel.routes.js";
import uploadRoute from "./routes/upload.routes.js";
import policyRoute from "./routes/services/policy.routes.js";
import bookingRoute from "./routes/booking.routes.js";
import hotelsRoute from "./routes/services/hotel/hotel.routes.js";
import adminsRoute from "./routes/user/admin.routes.js";
import roomsRoute from "./routes/services/hotel/rooms.routes.js";
import publicRoute from "./routes/public.routes.js";
import busRoute from "./routes/services/bus.routes.js";
import paymentRoute from "./routes/payment.routes.js";
import aboutRoute from "./routes/page/about.routes.js";
import tourRoute from "./routes/services/tour.routes.js";
import boardingRoute from "./routes/services/boardingRoutes.js";
import cruiseRoute from "./routes/services/cruise.routes.js";
import carRoute from "./routes/services/car.routes.js";
import googleAuthRoute from "./routes/google-auth.routes.js";
import exchangeRateRoute from "./routes/services/exchange-rate.routes.js";
import homePageRoute from "./routes/services/home-page.routes.js";
import contactUsRoute from "./routes/page/contact.routes.js"

// Controllers & Configs
import { PORT, MONGO_URI } from "./config/env.js";
import checkMaintenance from "./middlewares/maintenance.middleware.js";

// Swagger Auto-gen file load
const require = createRequire(import.meta.url);
const swaggerFile = require("./swagger-output.json");

const app = express();

app.disable('x-powered-by');

app.use(cors({
    origin: [
        'https://betelhospitality.com',
        'https://betel-hospitability.pages.dev',
        'https://dev.betelhospitality.com',
        'http://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));

mongoose.set('strictQuery', true);

const connect = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");
    } catch (e) {
        console.error("MongoDB Connection Error:", e);
        process.exit(1);
    }
};

mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB Disconnected");
});

// Middleware setup
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

// Swagger Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Health Check
app.get("/health", async (req, res) => {
    res.send({ message: "Health is ok" });
});

// Admin Routes (Login, Toggle Maintenance, Settings)
app.use("/api/admin", /* #swagger.tags = ['Admin'] */ adminsRoute);

// Auth Routes (Google Auth, Login flows)
app.use("/api/auth", /* #swagger.tags = ['Auth'] */ googleAuthRoute);

// Upload API (Thường admin cần upload ảnh khi đang sửa site)
app.use("/api/upload", /* #swagger.tags = ['Upload'] */ uploadRoute);



app.use(checkMaintenance);

app.use("/api/public", /* #swagger.tags = ['Public'] */ publicRoute);
app.use("/api/search", /* #swagger.tags = ['Search'] */ homePageRoute);

// Group: Hotels & Rooms
app.use("/api/hotels/services", /* #swagger.tags = ['Hotels'] */ serviceHotelRoute);
app.use("/api/hotels/facilities", /* #swagger.tags = ['Hotels'] */ facilityHotel);
app.use("/api/hotels", /* #swagger.tags = ['Hotels'] */ hotelsRoute);
app.use("/api/rooms", /* #swagger.tags = ['Rooms'] */ roomsRoute);

// Group: Booking & Users
app.use("/api/booking", /* #swagger.tags = ['Booking'] */ bookingRoute);
app.use("/api/users", /* #swagger.tags = ['Users'] */ usersRoute);

// Group: Services
app.use("/api/bus/boarding", /* #swagger.tags = ['Bus'] */ boardingRoute); // Cụ thể trước chung
app.use("/api/bus", /* #swagger.tags = ['Bus'] */ busRoute);
app.use("/api/cruises", /* #swagger.tags = ['cruise'] */ cruiseRoute);
app.use("/api/cars", /* #swagger.tags = ['car'] */ carRoute);
app.use("/api/tour", /* #swagger.tags = ['Tour'] */ tourRoute);

// Group: Misc
app.use("/api/policies", /* #swagger.tags = ['Policy'] */ policyRoute);
app.use("/api/payment", /* #swagger.tags = ['Payment'] */ paymentRoute);
app.use("/api/rates", /* #swagger.tags = ['Exchange Rate'] */ exchangeRateRoute);
app.use("/api/page", /* #swagger.tags = ['Page Content'] */ aboutRoute);
app.use("/api/contact", contactUsRoute)

// Error Handler
app.use((error, req, res, next) => {
    const errorStatus = error.status || 500;
    const errorMessage = error.message || "Something went wrong";

    if (process.env.NODE_ENV !== 'production') {
        console.error(error);
    }
    return res.status(errorStatus).json({
        success: false,
        status: errorStatus,
        message: errorMessage,
    });
});

app.listen(PORT, () => {
    connect();
    console.log(`Server running on port ${PORT}`);
    console.log(`Documentation available at http://localhost:${PORT}/api-docs`);
});