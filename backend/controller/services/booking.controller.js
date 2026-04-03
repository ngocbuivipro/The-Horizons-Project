import Booking from "../../models/payment/Booking.js"
import { sendMail } from "../../helpers/sendMail.js"
import { isValidPhoneNumber } from 'libphonenumber-js';
import Room from "../../models/hotel/Room.js";
import { getBookingSuccessHtml, updateBookingSuccessHtml } from "../../utils/template/emailTemplate.js";
import sendEmail from "../../utils/template/sendMail.js";
import Coupon from "../../models/settings/Coupon.js";
import { applyCouponLogic } from "./coupon.controller.js";
import Tour from "../../models/tour/Tour.js";
import Bus from "../../models/bus/Bus.js";
import SystemSetting from "../../models/settings/SystemSetting.js";
import Cruise from "../../models/cruise/Cruise.js";
import CarVehicle from "../../models/car/CarVehicle.js";
import CarRoute from "../../models/car/CarRoute.js";
import { CAR_STATUS, TRANSFER_TYPE } from "../../constants/car.constant.js";

// DEPRECATED: This function is temporarily not in use.
export const createOrder = async (req, res) => {
    return res.status(201).json({
        success: true,
        message: "Deprecated function"
    });
}


/**
 * Handles the creation of a new booking for various service types (Hotel, Tour, Bus, Cruise, Car).
 * It validates common fields, processes the booking based on its type, applies coupons,
 * and saves the final booking record to the database.
 *
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {Promise<object>} A JSON response indicating success or failure.
 */
export const createBooking = async (req, res) => {
    // 1 booking -> 1 user_id

    try {
        const {
            name, email, phoneNumber, isGuest, nameGuest,
            paymentMethod, request, couponCode, bookingType
        } = req.body;

        if (!name || !email || !phoneNumber || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Missing required contact/payment information."
            });
        }

        let processedData = null;

        //  Process Type-Specific  Availability & Price Calc
        try {
            switch (bookingType) {
                case "HOTEL":
                    processedData = await processHotelBooking(req.body);
                    break;
                case "TOUR":
                    processedData = await processTourBooking(req.body);
                    break;
                case "BUS":
                    processedData = await processBusBooking(req.body);
                    break;
                case "CRUISE":
                    processedData = await processCruiseBooking(req.body);
                    break;
                case "CAR":
                    processedData = await processCarBooking(req.body);
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: "Invalid booking type."
                    });
            }
        } catch (logicError) {
            return res.status(400).json({ success: false, message: logicError.message });
        }

        // Coupon Logic
        let finalPayAmount = processedData.totalOriginalPriceVND;
        let discountAmt = 0;
        let appliedCouponCode = null;
        let couponIdToUpdate = null;

        if (couponCode) {
            try {
                // Backend calculates the discount
                const couponResult = await applyCouponLogic(couponCode, processedData.totalOriginalPriceVND);
                discountAmt = couponResult.discountAmount;
                finalPayAmount = couponResult.finalPrice;
                appliedCouponCode = couponResult.code;
                couponIdToUpdate = couponResult.couponId;
            } catch (error) {
                return res.status(400).json({ success: false, message: `Coupon Error: ${error.message}` });
            }
        }

        // Processing Fee (Credit Card) — applied AFTER discount
        let processingFee = 0;
        if (paymentMethod === 'card') {
            const settings = await SystemSetting.findOne({ key: 'site_config' });
            const isEnabled = settings?.payment?.enableCreditCardFee ?? true;
            const configFeePercent = settings?.payment?.creditCardFeePercent || 0;
            if (isEnabled && configFeePercent > 0) {
                processingFee = Math.round(finalPayAmount * (configFeePercent / 100));
                finalPayAmount = finalPayAmount + processingFee;
            }
        }

        // Construct Booking Object
        const newBooking = new Booking({
            user: req.user?._id || req.body.userId || null,   // hỗ trợ cả user đã login và guest
            name,
            email,
            phoneNumber,
            isGuest,
            nameGuest: isGuest ? undefined : nameGuest,
            paymentMethod,
            request,

            // Spread processed data (ID, Dates, Guests, ProductName, etc.)
            ...processedData,

            // Force Currency to VND
            selectedCurrency: "VND",
            exchangeRate: 1,

            // Use Server-Calculated Prices (totalPriceVND includes processingFee)
            totalPriceVND: finalPayAmount,
            originalPriceVND: processedData.totalOriginalPriceVND,
            discountAmount: discountAmt,
            processingFee: processingFee,
            couponCode: appliedCouponCode,

            status: "UNPAID",
            stepPayment: true,
        });

        await newBooking.save();

        // Update Coupon Stats
        if (couponIdToUpdate) {
            await Coupon.updateOne({ _id: couponIdToUpdate }, { $inc: { usedCount: 1 } });
        }

        // Async Email Notification (Non-blocking)
        sendConfirmationEmail(newBooking, bookingType, paymentMethod, processedData.productName);

        return res.status(201).json({ success: true, data: newBooking });

    } catch (error) {
        console.error("Error in createBooking:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error: " + error.message
        });
    }
};

// --- HELPER FUNCTIONS ---
const sendConfirmationEmail = async (booking, type, method, productName) => {
    try {
        if (method !== 'transfer') return;

        let populatedBooking = await Booking.findById(booking._id);

        // Populate based on type for the email template
        if (type === "HOTEL") {
            populatedBooking = await populatedBooking.populate({ path: "roomType", populate: { path: "hotel" } });
        } else if (type === "TOUR") {
            populatedBooking = await populatedBooking.populate("tour");
        } else if (type === "BUS") {
            populatedBooking = await populatedBooking.populate("bus"); // This one is correct
        } else if (type === "CRUISE") {
            populatedBooking = await populatedBooking.populate("cruise");
        } else if (type === "CAR") {
            populatedBooking = await populatedBooking.populate("carVehicle"); // Changed from 'car' to 'carVehicle'
        }

        if (populatedBooking) {
            await sendEmail({
                email: populatedBooking.email,
                subject: `[The Horizons] Booking Received - ${productName || "Service"}`,
                html: getBookingSuccessHtml(populatedBooking)
            });
        }
    } catch (err) {
        console.error("Email sending failed:", err.message);
    }
};

const processCarBooking = async (body) => {
    const {
        carId,
        transferType, // 'One-way' or 'By the hour'
        origin,
        destination, // required for 'One-way'
        duration,    // required for 'By the hour'
        date,
        passengers
    } = body;

    if (!carId || !transferType || !origin || !date || !passengers) {
        // console.log(carId, " ", transferType, " ", origin, " ", date, " ", passengers)
        throw new Error("Missing required car booking information.");
    }

    const vehicle = await CarVehicle.findById(carId);
    if (!vehicle) throw new Error("Vehicle not found.");
    if (vehicle.status !== CAR_STATUS.ACTIVE) throw new Error("Selected vehicle is not available.");

    const numberOfGuests = Number(passengers);
    if (numberOfGuests > vehicle.maxPassengers) {
        throw new Error(`This vehicle can only accommodate up to ${vehicle.maxPassengers} passengers.`);
    }

    const transferDate = new Date(date);
    transferDate.setUTCHours(0, 0, 0, 0);

    let price = 0;
    let productName = "";

    if (transferType === TRANSFER_TYPE.HOURLY) {
        if (!duration) throw new Error("Duration is required for hourly rental.");
        const hours = parseInt(duration) || 1;
        price = vehicle.hourlyRate * hours;
        productName = `${vehicle.name} - Hourly Rental (${hours} hours) in ${origin}`;
    } else if (transferType === TRANSFER_TYPE.ONE_WAY) {
        if (!destination) throw new Error("Destination is required for one-way transfer.");

        const route = await CarRoute.findOne({
            origin: { $regex: new RegExp(origin, 'i') },
            destination: { $regex: new RegExp(destination, 'i') },
            isActive: true
        });

        if (!route) throw new Error(`No route found from ${origin} to ${destination}.`);

        const priceInfo = route.prices.find(p => p.vehicle.toString() === carId);
        if (!priceInfo) throw new Error(`The selected vehicle (${vehicle.name}) is not available for this route.`);

        price = priceInfo.price;
        productName = `Transfer from ${origin} to ${destination} (${vehicle.name})`;
    } else {
        throw new Error("Invalid transfer type specified.");
    }

    if (price <= 0) throw new Error("Could not calculate a valid price for this transfer.");

    return {
        bookingType: "CAR",
        car: carId,
        checkIn: transferDate, // Using checkIn for the transfer date
        checkOut: transferDate, // For car transfers, checkIn and checkOut are the same day
        guests: numberOfGuests,
        totalOriginalPriceVND: price,
        productName: productName,
        // Add car-specific details to be stored in the booking
        bookingDetails: {
            transferType,
            origin,
            destination: destination || null,
            duration: duration || null,
        }
    };
};

const processCruiseBooking = async (body) => {
    const { cruise: cruiseId, checkIn, guests, cabinId } = body;

    if (!cruiseId || !checkIn || !guests) throw new Error("Missing cruise booking info.");

    const numberOfGuests = Number(guests) || 1;
    if (numberOfGuests <= 0) throw new Error("Guests must be > 0.");

    const startDate = new Date(checkIn);
    startDate.setUTCHours(0, 0, 0, 0);

    const cruise = await Cruise.findById(cruiseId);
    if (!cruise) throw new Error("Cruise not found.");
    if (!cruise.isActive) throw new Error("Cruise is inactive.");

    // Availability Check
    if (cruise.availabilityRules?.length > 0) {
        const isBlocked = cruise.availabilityRules.some(rule => {
            const rStart = new Date(rule.startDate);
            const rEnd = new Date(rule.endDate);
            rStart.setUTCHours(0, 0, 0, 0);
            rEnd.setUTCHours(0, 0, 0, 0);
            return rule.isBlocked && (startDate >= rStart && startDate <= rEnd);
        });
        if (isBlocked) throw new Error(`Unavailable on ${startDate.toISOString().split('T')[0]}.`);
    }

    // Pricing Logic
    let unitPrice = 0;
    let nights = 1;
    let selectedCabinName = "";

    if (cabinId) {
        const selectedCabin = cruise.cabins.find(c => c._id.toString() === cabinId);
        if (!selectedCabin) throw new Error("Invalid cabin ID.");
        unitPrice = selectedCabin.pricePerNight;
        selectedCabinName = selectedCabin.name;
        nights = (cruise.duration && cruise.duration > 1) ? (cruise.duration - 1) : 1;
    } else {
        unitPrice = cruise.price;
        if (cruise.priceExtra?.length > 0) {
            const matchedExtra = cruise.priceExtra.find(extra => {
                const exStart = new Date(extra.start);
                const exEnd = new Date(extra.end);
                exStart.setUTCHours(0, 0, 0, 0);
                exEnd.setUTCHours(0, 0, 0, 0);
                return startDate >= exStart && startDate <= exEnd;
            });
            if (matchedExtra) unitPrice = Number(matchedExtra.price);
        }
    }

    const totalOriginalPriceVND = unitPrice * numberOfGuests * nights;
    const duration = cruise.duration || 1;
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + duration - 1);

    return {
        bookingType: "CRUISE",
        cruise: cruiseId,
        cabin: cabinId || null,
        checkIn: startDate,
        checkOut: endDate,
        guests: numberOfGuests,
        totalOriginalPriceVND,
        productName: `${cruise.title} ${selectedCabinName ? `(${selectedCabinName})` : ''}`,
    };
};

const processHotelBooking = async (body) => {
    const { roomType: roomTypeId, checkIn, checkOut, guests } = body;
    if (!roomTypeId || !checkIn || !checkOut) throw new Error("Missing Hotel info.");

    const numberOfGuests = Number(guests) || 1;
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(0, 0, 0, 0);

    if (startDate >= endDate) throw new Error("Check-out must be after check-in.");

    const room = await Room.findById(roomTypeId);
    if (!room) throw new Error("Room type not found.");

    // Blocked Date Check
    const blockedDatesSet = new Set();
    room.availabilityRules?.forEach(rule => {
        if (rule.isBlocked) {
            let curr = new Date(rule.startDate);
            const end = new Date(rule.endDate);
            curr.setUTCHours(0, 0, 0, 0);
            end.setUTCHours(0, 0, 0, 0);
            while (curr <= end) { blockedDatesSet.add(curr.getTime()); curr.setDate(curr.getDate() + 1); }
        }
    });

    let checkDate = new Date(startDate);
    while (checkDate < endDate) {
        if (blockedDatesSet.has(checkDate.getTime())) throw new Error(`Unavailable on ${checkDate.toISOString().split('T')[0]}`);
        checkDate.setDate(checkDate.getDate() + 1);
    }

    // Price Calc
    let totalOriginalPriceVND = 0;
    let curr = new Date(startDate);
    while (curr < endDate) {
        let unitPrice = Number(room.price);
        if (room.priceExtra?.length > 0) {
            const currTime = curr.getTime();
            const match = room.priceExtra.find(e => currTime >= new Date(e.start).getTime() && currTime <= new Date(e.end).getTime());
            if (match) unitPrice = Number(match.price);
        }
        totalOriginalPriceVND += (unitPrice * numberOfGuests);
        curr.setDate(curr.getDate() + 1);
    }

    return {
        bookingType: "HOTEL",
        roomType: roomTypeId,
        checkIn: startDate,
        checkOut: endDate,
        guests: numberOfGuests,
        totalOriginalPriceVND,
        productName: room.RoomType,
    };
};

const processTourBooking = async (body) => {
    const { tour: tourId, checkIn, adults, children } = body;
    if (!tourId || !checkIn) throw new Error("Missing Tour info.");

    const startDate = new Date(checkIn);
    startDate.setUTCHours(0, 0, 0, 0);

    const countAdults = Number(adults) || 1;
    const countChildren = Number(children) || 0;

    const tour = await Tour.findById(tourId);
    if (!tour) throw new Error("Tour not found.");

    if (tour.availabilityRules?.some(rule => {
        const rStart = new Date(rule.startDate);
        const rEnd = new Date(rule.endDate);
        rStart.setUTCHours(0, 0, 0, 0); rEnd.setUTCHours(0, 0, 0, 0);
        return rule.isBlocked && (startDate >= rStart && startDate <= rEnd);
    })) throw new Error(`Unavailable on ${startDate.toISOString().split('T')[0]}`);

    let adultPrice = tour.price;
    let childPrice = tour.priceChildren || tour.price;

    if (tour.priceExtra?.length > 0) {
        const match = tour.priceExtra.find(e => {
            const s = new Date(e.start); const en = new Date(e.end);
            s.setUTCHours(0, 0, 0, 0); en.setUTCHours(0, 0, 0, 0);
            return startDate >= s && startDate <= en;
        });
        if (match) adultPrice = Number(match.price);
    }

    const totalOriginalPriceVND = (adultPrice * countAdults) + (childPrice * countChildren);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (tour.duration || 1));

    return {
        bookingType: "TOUR",
        tour: tourId,
        checkIn: startDate,
        checkOut: endDate,
        guests: countAdults + countChildren,
        totalOriginalPriceVND,
        productName: tour.name,
    };
};

const processBusBooking = async (body) => {
    const { bus: busId, departureDate, seats } = body;
    if (!busId || !departureDate || !seats) throw new Error("Missing bus info.");

    const numberOfSeats = Number(seats);
    const travelDate = new Date(departureDate);
    travelDate.setUTCHours(0, 0, 0, 0);

    const bus = await Bus.findById(busId);
    if (!bus) throw new Error("Bus not found.");

    if (bus.availabilityRules?.some(rule => {
        const rStart = new Date(rule.startDate); rStart.setUTCHours(0, 0, 0, 0);
        const rEnd = new Date(rule.endDate); rEnd.setUTCHours(0, 0, 0, 0);
        return rule.isBlocked && (travelDate >= rStart && travelDate <= rEnd);
    })) throw new Error("Bus unavailable.");

    let unitPrice = bus.price;
    if (bus.priceExtra?.length > 0) {
        const match = bus.priceExtra.find(e => {
            const s = new Date(e.startDate); s.setUTCHours(0, 0, 0, 0);
            const en = new Date(e.endDate); en.setUTCHours(0, 0, 0, 0);
            return travelDate >= s && travelDate <= en;
        });
        if (match) unitPrice = match.price;
    }

    return {
        bookingType: "BUS",
        bus: busId,
        checkIn: travelDate,
        checkOut: travelDate,
        guests: numberOfSeats,
        totalOriginalPriceVND: unitPrice * numberOfSeats,
        productName: `${bus.operator} - ${bus.cityFrom} to ${bus.cityTo}`
    };
};


/**
 * Retrieves a single booking by its ID, populating related data for different booking types.
 * @param {object} req - The Express request object, containing the booking ID in params.
 * @param {object} res - The Express response object.
 */
export const getBooking = async (req, res) => {
    try {
        const data = await Booking.findOne({ _id: req.params.id })
            .populate({
                path: "roomType",
                populate: [
                    { path: "hotel", populate: { path: "policy" } },
                    { path: "services" },
                    { path: "facilities" }
                ],
            })
            .populate("tour")
            .populate("bus")
            .populate("cruise") // This one is correct
            .populate("carVehicle"); // Changed from 'car' to 'carVehicle'

        if (data) {
            return res.json({ success: true, data: data });
        } else {
            return res.status(404).json({ success: false, message: "Booking not found." });
        }
    } catch (error) {
        console.error("Error in getBooking:", error);
        return res.status(500).json({ success: false, message: "Error retrieving booking by ID." });
    }
};

/**
 * Retrieves all bookings associated with a specific email address, sorted by creation date.
 * @param {object} req - The Express request object, containing the email in params.
 * @param {object} res - The Express response object.
 */
export const getByEmail = async (req, res) => {
    try {
        const data = await Booking.find({ email: req.params.email }).sort({ createdAt: -1 })
            .populate({
                path: "roomType",
                populate: [
                    { path: "hotel", populate: { path: "policy" } },
                    { path: "services" },
                    { path: "facilities" }
                ],
            })
            .populate("tour")
            .populate("bus")
            .populate("cruise")
            .populate("carVehicle");
        return res.json({ success: true, data: data });
    } catch (error) {
        console.error("Error in getByEmail:", error);
        return res.status(500).json({ success: false, message: "Error retrieving bookings by email." });
    }
};

/**
 * Updates the status of a booking to 'CONFIRM'.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
export const updateStatus = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({ success: false, message: "Booking ID is required." });
        }

        // Legacy validation for a 'stepPayment' flow.
        if (req.body.stepPayment) {
            const { phoneNumber } = req.body;
            if (!phoneNumber || !isValidPhoneNumber(String(phoneNumber))) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid phone number provided. Please provide a valid number with country code."
                });
            }
        }

        let updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: "CONFIRM" },
            { new: true, runValidators: true }
        );

        if (!updatedBooking) {
            return res.status(404).json({ success: false, message: "Booking not found." });
        }

        // Populate data for potential follow-up actions.
        updatedBooking = await updatedBooking.populate({
            path: "roomType",
            populate: { path: "hotel", populate: { path: "policy" } },
        });

        return res.status(200).json({
            success: true,
            message: "Booking updated successfully",
            data: updatedBooking,
        });
    } catch (error) {
        console.error("Error in updateStatus:", error);
        return res.status(500).json({ success: false, message: "Error updating booking status." });
    }
};

/**
 * Performs a general update on a booking record with the provided request body.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
export const updateBooking = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({ success: false, message: "Booking ID is required." });
        }

        let updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // Return the updated document and run schema validators.
        );

        if (!updatedBooking) {
            return res.status(404).json({ success: false, message: "Booking not found." });
        }

        if (req.body.status === "PENDING" || req.body.status === "UNPAID") {
            updatedBooking = await updatedBooking.populate({
                path: "roomType",
                populate: { path: "hotel" },
            });
            await sendMail({
                email: updatedBooking.email,
                subject: `[BetelHospitability] Payment Successful – ${updatedBooking.roomType.hotel.name}`,
                html: updateBookingSuccessHtml(updatedBooking)
            });
        }

        return res.status(200).json({
            success: true,
            message: "Booking updated successfully",
            data: updatedBooking,
        });
    } catch (error) {
        console.error("Error in updateBooking:", error);
        return res.status(500).json({ success: false, message: "Error updating booking: " + error.toString() });
    }
};

/**
 * Retrieves a paginated, filtered, and sorted list of all bookings.
 * @param {object} req - The Express request object with query parameters for filtering, sorting, and pagination.
 * @param {object} res - The Express response object.
 */
export const getAllBooking = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {
            // isDeleted: false // Default to excluding soft-deleted records if needed.
        };

        if (req.query.status) filter.status = req.query.status;
        if (req.query.bookingType) filter.bookingType = req.query.bookingType;
        if (req.query.isPaid !== undefined) filter.isPaid = req.query.isPaid === 'true';
        if (req.query.search) filter.email = new RegExp(req.query.search, 'i');

        // --- Build Sort Criteria ---
        const sort = {};
        const sortBy = req.query.sortBy || 'createdAt';
        const order = req.query.order || 'desc';

        if (['createdAt', 'totalPriceVND'].includes(sortBy)) {
            sort[sortBy] = order === 'asc' ? 1 : -1;
        }

        const [bookings, total] = await Promise.all([
            Booking.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate({ path: "roomType", select: "RoomType Hotel", populate: { path: "hotel", select: "name" } })
                .populate({ path: "bus", select: "name brand licensePlate" })
                .populate({ path: "tour", select: "name" })
                .populate({ path: "cruise", select: "title city duration" })
                .populate({ path: "carVehicle", select: "name type category" }) // Changed from 'car' to 'carVehicle'
                .lean(),
            Booking.countDocuments(filter).exec()
        ]);

        return res.status(200).json({
            success: true,
            data: bookings,
            total,
            count: bookings.length,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error("Error in getAllBooking:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Soft deletes a booking by setting its `isDeleted` flag to true and status to 'CANCELLED'.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
export const softDeleteBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findByIdAndUpdate(
            id,
            { isDeleted: true, status: 'CANCELLED' },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Booking moved to trash successfully",
            data: booking
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Permanently deletes a booking from the database.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
export const hardDeleteBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findByIdAndDelete(id);

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Booking deleted permanently"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


// ==========================================
// Price Calculation Endpoints
// ==========================================

/**
 * A helper function to apply coupon discounts and calculate payment processing fees.
 * @param {number} originalPrice - The original price of the booking before any deductions or fees.
 * @param {string} couponCode - The coupon code to apply.
 * @param {string} paymentMethod - The payment method ('card', 'transfer', etc.).
 * @returns {Promise<object>} An object containing detailed pricing information.
 * @throws {Error} Throws an error if the coupon code is invalid.
 */
const applyDiscountsAndFees = async (originalPrice, couponCode, paymentMethod) => {
    // 1. Apply coupon if provided
    let discountInfo = {
        discountAmount: 0,
        priceAfterDiscount: originalPrice,
        couponId: null,
        appliedCode: null,
        message: null,
    };

    if (couponCode) {
        // `calculateDiscount` will throw an error if the coupon is invalid.
        const result = await calculateDiscount(couponCode, originalPrice);
        discountInfo = {
            discountAmount: result.discountAmount,
            priceAfterDiscount: result.finalPrice,
            couponId: result.couponId,
            appliedCode: couponCode,
            message: "Coupon applied successfully!",
        };
    }

    // Calculate payment processing fee
    let processingFee = 0;
    let feePercent = 0;
    if (paymentMethod === 'card') {
        const settings = await SystemSetting.findOne({ key: 'site_config' });
        const isEnabled = settings?.payment?.enableCreditCardFee ?? true;
        const configFeePercent = settings?.payment?.creditCardFeePercent || 0;

        if (isEnabled && configFeePercent > 0) {
            feePercent = configFeePercent;
            processingFee = Math.round(discountInfo.priceAfterDiscount * (configFeePercent / 100));
        }
    }

    const totalAmountToPay = discountInfo.priceAfterDiscount + processingFee;

    return {
        ...discountInfo,
        processingFee,
        feePercent,
        finalPrice: totalAmountToPay,
    };
};

/**
 * Calculates the price for an accommodation booking based on daily rates and applies discounts/fees.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
export const calculateBookingAccommodationPrice = async (req, res) => {
    try {
        // Extract roomQuantity instead of guests for price calculation
        const { checkIn, checkOut, roomTypeId, roomQuantity, couponCode, paymentMethod } = req.body;

        if (!checkIn || !checkOut || !roomTypeId) {
            return res.status(400).json({
                success: false,
                message: "Missing required information (checkIn, checkOut, roomType)."
            });
        }

        // Default to 1 room if not specified
        const numberOfRooms = Number(roomQuantity) || 1;

        const startDate = new Date(checkIn);
        const endDate = new Date(checkOut);

        // Normalize dates to UTC midnight to ensure consistent day-difference calculation
        startDate.setUTCHours(0, 0, 0, 0);
        endDate.setUTCHours(0, 0, 0, 0);

        if (startDate >= endDate) {
            return res.status(400).json({ success: false, message: "Check-out date must be after check-in date." });
        }

        const room = await Room.findById(roomTypeId);
        if (!room) {
            return res.status(404).json({ success: false, message: "Room type not found." });
        }

        let totalBasePricePerRoom = 0;
        let totalPriceOriginal = 0;
        let breakdown = [];
        const currentDate = new Date(startDate);

        // Iterate through date range to apply dynamic pricing (Standard vs Special Rate)
        while (currentDate < endDate) {
            let unitPrice = Number(room.price);
            let note = "Standard Rate";

            // Optimization: Filter logic could be moved to database query if priceExtra grows large,
            // but for typical implementation, in-memory find is acceptable.
            if (room.priceExtra?.length > 0) {
                const currentMillis = currentDate.getTime();
                const matchedExtra = room.priceExtra.find(extra => {
                    const extraStart = new Date(extra.start).getTime();
                    const extraEnd = new Date(extra.end).getTime();
                    return currentMillis >= extraStart && currentMillis < extraEnd;
                });

                if (matchedExtra) {
                    unitPrice = Number(matchedExtra.title || matchedExtra.price);
                    note = "Special Rate";
                }
            }

            totalBasePricePerRoom += unitPrice;

            // Logic Change: Calculate daily total based on Number of Rooms
            const dailyTotal = unitPrice * numberOfRooms;
            totalPriceOriginal += dailyTotal;

            breakdown.push({
                date: new Date(currentDate),
                unitPrice: unitPrice,
                rooms: numberOfRooms, // Updated field
                totalDailyPrice: dailyTotal,
                note: note
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Discount Service integration
        try {
            const priceDetails = await applyDiscountsAndFees(totalPriceOriginal, couponCode, paymentMethod);

            return res.status(200).json({
                success: true,
                roomName: room.RoomType,
                numberOfRooms: numberOfRooms,
                numberOfDays: breakdown.length,
                pricePerRoom: totalBasePricePerRoom, // Base price for 1 room across total days
                originalPrice: totalPriceOriginal,
                couponApplied: !!priceDetails.couponId,
                discountAmount: priceDetails.discountAmount,
                feePercent: priceDetails.feePercent,
                processingFee: priceDetails.processingFee,
                finalPrice: priceDetails.finalPrice,
                couponMessage: priceDetails.message,
                breakdown: breakdown,
            });

        } catch (err) {
            // Graceful degradation: Return base calculation even if discount service fails
            return res.status(400).json({
                success: false,
                message: err.message,
                originalPrice: totalPriceOriginal,
                finalPrice: totalPriceOriginal,
                roomName: room.RoomType,
                numberOfRooms: numberOfRooms,
                numberOfDays: breakdown.length,
                pricePerRoom: totalBasePricePerRoom,
                breakdown: breakdown,
                discountAmount: 0,
                feePercent: 0,
                processingFee: 0,
            });
        }

    } catch (error) {
        console.error("Calculate Price Error:", error);
        return res.status(500).json({ success: false, message: `Server Error: ${error.message}` });
    }
};


/**
 * Calculates the price for a bus booking, considering seasonal rates and applying discounts/fees.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
export const calculateBookingBusPrice = async (req, res) => {
    try {
        const { busId, date, seats, couponCode, paymentMethod } = req.body;

        // --- 1. Validation ---
        if (!busId || !date || !seats) {
            return res.status(400).json({
                success: false,
                message: "Missing required information (busId, date, seats)."
            });
        }

        const bus = await Bus.findById(busId);
        if (!bus) {
            return res.status(404).json({ success: false, message: "Bus trip not found." });
        }

        // Calculate Base Price
        let unitPrice = bus.price; // Default price
        let note = "Standard Price";

        // Normalize date for comparison.
        const queryDate = new Date(date);
        queryDate.setUTCHours(0, 0, 0, 0);

        // Check for special pricing (e.g., holidays, weekends).
        if (bus.priceExtra && bus.priceExtra.length > 0) {
            const matchedExtra = bus.priceExtra.find(extra => {
                const start = new Date(extra.startDate);
                const end = new Date(extra.endDate);

                // Normalize DB dates for accurate comparison.
                start.setUTCHours(0, 0, 0, 0);
                end.setUTCHours(0, 0, 0, 0);

                return queryDate >= start && queryDate <= end;
            });

            if (matchedExtra) {
                unitPrice = Number(matchedExtra.price);
                note = matchedExtra.title || "Holiday/Special Price";
            }
        }

        const numberOfSeats = Number(seats);
        const originalPrice = unitPrice * numberOfSeats;

        // --- Apply Discounts & Fees ---
        try {
            const priceDetails = await applyDiscountsAndFees(originalPrice, couponCode, paymentMethod);

            return res.status(200).json({
                success: true,
                data: {
                    unitPrice: unitPrice,
                    seats: numberOfSeats,
                    originalPrice: originalPrice,
                    couponApplied: !!priceDetails.couponId,
                    appliedCode: priceDetails.appliedCode,
                    discountAmount: priceDetails.discountAmount,
                    couponMessage: priceDetails.message,
                    feePercent: priceDetails.feePercent,
                    processingFee: priceDetails.processingFee,
                    finalPrice: priceDetails.finalPrice,
                    note: note,
                    busOperator: bus.operator
                }
            });
        } catch (err) {
            // Handle coupon errors gracefully.
            return res.status(400).json({
                success: false,
                message: err.message || "Invalid coupon code",
                data: {
                    originalPrice: originalPrice,
                    finalPrice: originalPrice,
                    discountAmount: 0,
                    unitPrice,
                    seats: numberOfSeats,
                    note,
                    couponMessage: null,
                    busOperator: bus.operator,
                    feePercent: 0,
                    processingFee: 0,
                }
            });
        }

    } catch (err) {
        console.error("Calculate Bus Price Error:", err);
        return res.status(500).json({ success: false, message: "Server error: " + err.message });
    }
};

/**
 * Calculates the price for a Tour booking, considering adult/child prices and seasonal rates.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
export const calculateBookingTourPrice = async (req, res) => {
    try {
        const { tourId, checkIn, adults, children, couponCode, paymentMethod } = req.body;

        if (!tourId || !checkIn || !adults) {
            return res.status(400).json({
                success: false,
                message: "Missing required info (tourId, checkIn date, guests)."
            });
        }

        const tour = await Tour.findById(tourId);
        if (!tour) {
            return res.status(404).json({ success: false, message: "Tour not found." });
        }

        const tourDate = new Date(checkIn);
        tourDate.setUTCHours(0, 0, 0, 0);

        let adultPrice = tour.price;
        let childPrice = tour.priceChildren || 0;
        let note = "Standard Rate";

        // Check for special pricing (e.g., peak season, holidays).
        if (tour.priceExtra && tour.priceExtra.length > 0) {
            const matchedExtra = tour.priceExtra.find(extra => {
                const start = new Date(extra.start);
                const end = new Date(extra.end);
                start.setUTCHours(0, 0, 0, 0);
                end.setUTCHours(0, 0, 0, 0);

                return tourDate >= start && tourDate <= end;
            });

            if (matchedExtra) {
                adultPrice = Number(matchedExtra.price);
                note = "Special/Holiday Rate";
            }
        }

        const numAdults = Number(adults) || 1;
        const numChildren = Number(children) || 0;

        const totalAdults = adultPrice * numAdults;
        const totalChildren = childPrice * numChildren;

        const originalPrice = totalAdults + totalChildren;

        // --- Apply Discounts & Fees ---
        try {
            const priceDetails = await applyDiscountsAndFees(originalPrice, couponCode, paymentMethod);

            return res.status(200).json({
                success: true,
                data: {
                    tourName: tour.name,
                    duration: tour.durationText || `${tour.duration} days`,
                    adultPrice: adultPrice,
                    childPrice: childPrice,
                    numAdults: numAdults,
                    numChildren: numChildren,
                    originalPrice: originalPrice,
                    couponApplied: !!priceDetails.couponId,
                    appliedCode: priceDetails.appliedCode,
                    discountAmount: priceDetails.discountAmount,
                    couponMessage: priceDetails.message,
                    feePercent: priceDetails.feePercent,
                    processingFee: priceDetails.processingFee,
                    finalPrice: priceDetails.finalPrice,
                    note: note
                }
            });
        } catch (err) {
            // Handle coupon errors gracefully.
            return res.status(400).json({
                success: false,
                message: err.message,
                data: {
                    originalPrice,
                    finalPrice: originalPrice,
                    tourName: tour.name,
                    duration: tour.durationText || `${tour.duration} days`,
                    adultPrice,
                    childPrice,
                    numAdults,
                    numChildren,
                    note,
                    discountAmount: 0,
                    feePercent: 0,
                    processingFee: 0,
                }
            });
        }

    } catch (error) {
        console.error("Calculate Tour Price Error:", error);
        return res.status(500).json({ success: false, message: "Server error: " + error.message });
    }
};

/**
 * Validates a coupon code and calculates the discount amount.
 * @param {string} couponCode - The coupon code entered by the user.
 * @param {number} totalOrderValue - The total value of the order before discount.
 * @returns {Promise<object>} An object with discount details.
 * @throws {Error} If the coupon is invalid, expired, or does not meet conditions.
 */
const calculateDiscount = async (couponCode, totalOrderValue) => {
    if (!couponCode) return { discountAmount: 0, finalPrice: totalOrderValue, couponId: null };

    const upperCode = couponCode.toUpperCase().trim();
    const now = new Date();

    const activeCoupons = await Coupon.find({ isActive: true });
    let matchedCoupon = null;

    for (const coupon of activeCoupons) {
        if (coupon.startDate && now < new Date(coupon.startDate)) continue;
        if (coupon.endDate && now > new Date(coupon.endDate)) continue;
        if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) continue;

        if (coupon.matchType === 'EXACT' && coupon.code === upperCode) {
            matchedCoupon = coupon;
            break;
        } else if (coupon.matchType === 'PREFIX' && upperCode.startsWith(coupon.code)) {
            // Match by prefix (e.g., DB has 'SUMMER', user enters 'SUMMER2024').
            matchedCoupon = coupon;
            break;
        }
    }

    if (!matchedCoupon) {
        throw new Error(`Coupon code '${couponCode}' is invalid or has expired.`);
    }

    if (totalOrderValue < matchedCoupon.minOrderValue) {
        throw new Error(`Order must be at least ${matchedCoupon.minOrderValue.toLocaleString('en-US')} to apply this coupon.`);
    }

    let discount = 0;
    if (matchedCoupon.discountType === "PERCENT") {
        discount = (totalOrderValue * matchedCoupon.discountValue) / 100;
        if (matchedCoupon.maxDiscountAmount && discount > matchedCoupon.maxDiscountAmount) {
            discount = matchedCoupon.maxDiscountAmount;
        }
    } else if (matchedCoupon.discountType === "FIXED") {
        discount = matchedCoupon.discountValue;
    }

    if (discount > totalOrderValue) discount = totalOrderValue;

    return {
        couponId: matchedCoupon._id,
        code: matchedCoupon.code,
        matchType: matchedCoupon.matchType,
        discountAmount: Math.round(discount),
        finalPrice: totalOrderValue - Math.round(discount)
    };
};

/**
 * Calculates the price for a cruise booking, prioritizing cabin-based pricing.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
export const calculateBookingCruisePrice = async (req, res) => {
    try {
        const { cruiseId, cabinId, checkIn, guests, couponCode, paymentMethod, currency } = req.body;

        if (!cruiseId || !checkIn || !guests) {
            return res.status(400).json({
                success: false,
                message: "Missing required info (cruiseId, checkIn date, guests)."
            });
        }

        const cruise = await Cruise.findById(cruiseId);
        if (!cruise) return res.status(404).json({ success: false, message: "cruise not found." });
        if (!cruise.isActive) return res.status(400).json({ success: false, message: "This cruise is not available for booking." });

        const tourDate = new Date(checkIn);
        tourDate.setUTCHours(0, 0, 0, 0);

        // --- Availability Check ---
        if (cruise.availabilityRules?.length > 0) {
            const isBlocked = cruise.availabilityRules.some(rule => {
                const ruleStart = new Date(rule.startDate);
                const ruleEnd = new Date(rule.endDate);
                ruleStart.setUTCHours(0, 0, 0, 0);
                ruleEnd.setUTCHours(0, 0, 0, 0);
                return rule.isBlocked && (tourDate >= ruleStart && tourDate <= ruleEnd);
            });
            if (isBlocked) {
                return res.status(400).json({ success: false, message: `Cruise is not available on ${tourDate.toISOString().split('T')[0]}.` });
            }
        }

        let unitPrice = 0;
        let note = "Standard Rate";
        let nights = 1;

        // Price calculation based on selected cabin ---
        if (cabinId) {
            const selectedCabin = cruise.cabins.find(c => c._id.toString() === cabinId);
            if (!selectedCabin) return res.status(404).json({ success: false, message: "Selected cabin not found in this cruise." });

            unitPrice = selectedCabin.pricePerNight;
            note = `Cabin: ${selectedCabin.name} (${selectedCabin.viewType})`;
            nights = (cruise.duration && cruise.duration > 1) ? (cruise.duration - 1) : 1;
        } else {
            // Price per trip (if no cabin is selected)
            unitPrice = cruise.price;
            if (cruise.priceExtra && cruise.priceExtra.length > 0) {
                const matchedExtra = cruise.priceExtra.find(extra => {
                    const start = new Date(extra.start);
                    const end = new Date(extra.end);
                    start.setUTCHours(0, 0, 0, 0);
                    end.setUTCHours(0, 0, 0, 0);
                    return tourDate >= start && tourDate <= end;
                });
                if (matchedExtra) {
                    unitPrice = Number(matchedExtra.price);
                    note = "Special/Holiday Rate";
                }
            }
        }

        const numberOfGuests = Number(guests) || 1;
        const originalPrice = unitPrice * numberOfGuests * nights;

        // --- Apply Discounts & Fees ---
        try {
            const priceDetails = await applyDiscountsAndFees(originalPrice, couponCode, paymentMethod);

            return res.status(200).json({
                success: true,
                data: {
                    cruiseName: cruise.title,
                    duration: cruise.duration,
                    checkIn: tourDate,
                    nights: nights,
                    unitPrice: unitPrice,
                    guests: numberOfGuests,
                    originalPrice: originalPrice,
                    couponApplied: !!priceDetails.couponId,
                    appliedCode: priceDetails.appliedCode,
                    discountAmount: priceDetails.discountAmount,
                    couponMessage: priceDetails.message,
                    feePercent: priceDetails.feePercent,
                    processingFee: priceDetails.processingFee,
                    finalPrice: priceDetails.finalPrice,
                    note: note,
                    currency: currency || "VND"
                }
            });
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: err.message,
                data: {
                    originalPrice,
                    finalPrice: originalPrice,
                    cruiseName: cruise.title,
                    note,
                    discountAmount: 0
                }
            });
        }

    } catch (error) {
        console.error("Calculate cruise Price Error:", error);
        return res.status(500).json({ success: false, message: "Server error: " + error.message });
    }
};

/**
 * Calculates the price for a car transfer booking, applying discounts/fees.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
export const calculateBookingCarPrice = async (req, res) => {
    try {
        const {
            carId,
            transferType, // 'One-way' or 'By the hour'
            origin,
            destination,
            duration,    // required for 'By the hour'
            couponCode,
            paymentMethod
        } = req.body;

        if (!carId || !transferType || !origin) {
            return res.status(400).json({ success: false, message: "Missing required car pricing information." });
        }

        const vehicle = await CarVehicle.findById(carId);
        if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found." });
        console.log(vehicle)
        if (vehicle.status !== CAR_STATUS.ACTIVE) return res.status(400).json({ success: false, message: "Selected vehicle is not available." });

        let originalPrice = 0;
        let note = "";

        if (transferType === TRANSFER_TYPE.HOURLY) {
            if (!duration) return res.status(400).json({ success: false, message: "Duration is required for hourly rental." });
            const hours = parseInt(duration) || 1;
            originalPrice = vehicle.hourlyRate * hours;
            note = `Hourly rental for ${hours} hours`;
        } else if (transferType === TRANSFER_TYPE.ONE_WAY) {
            if (!destination) return res.status(400).json({ success: false, message: "Destination is required for one-way transfer." });

            const route = await CarRoute.findOne({
                origin: { $regex: new RegExp(origin, 'i') },
                destination: { $regex: new RegExp(destination, 'i') },
                isActive: true
            });

            if (!route) return res.status(404).json({ success: false, message: `No route found from ${origin} to ${destination}.` });

            const priceInfo = route.prices.find(p => p.vehicle.toString() === carId);
            if (!priceInfo) return res.status(404).json({ success: false, message: `The selected vehicle is not available for this route.` });

            originalPrice = priceInfo.price;
            note = `Transfer from ${origin} to ${destination}`;
        } else {
            return res.status(400).json({ success: false, message: "Invalid transfer type specified." });
        }

        if (originalPrice <= 0) {
            return res.status(400).json({ success: false, message: "Could not calculate a valid price for this transfer." });
        }

        // --- Apply Discounts & Fees ---
        try {
            const priceDetails = await applyDiscountsAndFees(originalPrice, couponCode, paymentMethod);

            return res.status(200).json({
                success: true,
                data: {
                    vehicleName: vehicle.name,
                    vehicleType: vehicle.category || vehicle.type,
                    transferType: transferType,
                    note: note,
                    originalPrice: originalPrice,
                    couponApplied: !!priceDetails.couponId,
                    appliedCode: priceDetails.appliedCode,
                    discountAmount: priceDetails.discountAmount,
                    couponMessage: priceDetails.message,
                    feePercent: priceDetails.feePercent,
                    processingFee: priceDetails.processingFee,
                    finalPrice: priceDetails.finalPrice,
                }
            });
        } catch (err) {
            // Handle coupon errors gracefully.
            return res.status(400).json({ success: false, message: err.message, data: { originalPrice, finalPrice: originalPrice, vehicleName: vehicle.name, note, discountAmount: 0, feePercent: 0, processingFee: 0, } });
        }

    } catch (error) {
        console.error("Calculate Car Price Error:", error);
        return res.status(500).json({ success: false, message: "Server error: " + error.message });
    }
};

/**
 * A maintenance utility to delete booking records that are missing essential data like email or price.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
export const cleanupInvalidBookings = async (req, res) => {
    try {
        const query = {
            $or: [
                { email: null },
                { totalPriceVND: null }
            ]
        };

        const result = await Booking.deleteMany(query);

        return res.status(200).json({
            success: true,
            message: `Cleanup successful. Deleted ${result.deletedCount} invalid bookings.`,
            data: {
                deletedCount: result.deletedCount
            }
        });
    } catch (error) {
        console.error("Error cleaning up invalid bookings:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred during the cleanup process.",
            error: error.message
        });
    }
};
