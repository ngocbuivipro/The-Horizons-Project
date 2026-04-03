import Cruise from "../../models/cruise/Cruise.js";
import Cabin from "../../models/cruise/Cabin.js";
import { createError } from "../../utils/error.js";
import dayjs from "dayjs";
import mongoose from "mongoose";


const calculateMinPrice = (cabins, manualPrice) => {
    if (cabins && cabins.length > 0) {
        // Tìm giá nhỏ nhất trong mảng cabins
        const minCabinPrice = Math.min(...cabins.map(c => Number(c.pricePerNight)));
        return minCabinPrice;
    }
    return Number(manualPrice) || 0;
};

export const createCruise = async (req, res, next) => {
    try {
        const {
            title, cruiseType, launchedOn, duration,
            price,
            isActive, departureTime, city,
            amenities, itinerary, additionalServices,
            description, faq, photos,
            cabins
        } = req.body;

        if (!title || !city) {
            return next(createError(400, "Title and City are required"));
        }

        const finalPrice = calculateMinPrice(cabins, price);
        const thumbnail = (photos && photos.length > 0) ? photos[0] : "";

        const newCruise = new Cruise({
            title,
            cruiseType: cruiseType || "Luxury cruise",
            launchedOn: launchedOn ? new Date(launchedOn) : null,
            duration: Number(duration) || 1,
            price: finalPrice,
            thumbnail,
            city,
            amenities: amenities || [],
            itinerary: itinerary || [],
            cabins: cabins || [], // Lưu trực tiếp
            additionalServices: additionalServices || [],
            description: description || "",
            faq: faq || [],
            photos: photos || [],
            departureTime: departureTime ? new Date(departureTime) : new Date(),
            isActive: isActive !== undefined ? isActive : true
        });

        const savedCruise = await newCruise.save();

        res.status(200).json({
            success: true,
            message: "cruise created successfully",
        });

    } catch (err) {
        next(err);
    }
};

export const createCabin = async (req, res, next) => {
    try {
        const {
            name, viewType, pricePerNight,
            specifications, amenities, description, photos
        } = req.body;

        const newCabinTemplate = new Cabin({
            cruiseId: null, // Luôn là null vì đây là Template
            name,
            viewType: viewType || "Ocean View",
            pricePerNight: Number(pricePerNight),
            specifications: specifications || {},
            amenities: amenities || [],
            description,
            photos: photos || []
        });

        const savedTemplate = await newCabinTemplate.save();

        res.status(200).json({
            success: true,
            message: "Cabin Template created successfully",
            data: savedTemplate
        });
    } catch (err) {
        next(err);
    }
};


export const searchCruise = async (req, res, next) => {
    try {
        const {
            location,
            date,
            minPrice,
            maxPrice,
            sort,
            amenities,
            type,
            duration,
            page = 1,
            limit = 10
        } = req.query;

        const currentPage = parseInt(page);
        const pageLimit = parseInt(limit);
        const skip = (currentPage - 1) * pageLimit;

        const searchDateStr = date || dayjs().format("YYYY-MM-DD");

        const query = { isActive: true };

        // Search by city / title
        if (location) {
            const keywordRegex = { $regex: location, $options: "i" };
            query.$or = [
                { city: keywordRegex },
                { title: keywordRegex }
            ];
        }

        if (type) {
            query.cruiseType = { $regex: type, $options: "i" };
        }

        if (amenities) {
            const requiredAmenities = amenities.split(",");
            query["amenities.items"] = { $all: requiredAmenities };
        }

        if (duration) {
            const mapped = duration.split(",").map(Number).filter(d => !isNaN(d));
            if (mapped.length > 0) query.duration = { $in: mapped };
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const selectFields =
            "title cruiseType price duration thumbnail city departureTime rating totalReviews amenities createdAt slug";

        // Lấy toàn bộ kết quả hợp lệ (để xử lý date + sort)
        let cruises = await Cruise.find(query)
            .select(selectFields)
            .lean();

        // Map lại departureTime theo ngày search
        const processedCruises = cruises.map(cruise => {
            const originalDep = new Date(
                cruise.departureTime || new Date().setHours(8, 0, 0, 0)
            );

            const newDepartureDate = new Date(searchDateStr);
            newDepartureDate.setHours(
                originalDep.getHours(),
                originalDep.getMinutes(),
                0,
                0
            );

            const newEndDate = new Date(newDepartureDate);
            newEndDate.setDate(
                newEndDate.getDate() + (cruise.duration || 1)
            );

            return {
                ...cruise,
                departureTime: newDepartureDate.toISOString(),
                endTime: newEndDate.toISOString()
            };
        });

        // Sorting
        if (sort) {
            switch (sort) {
                case "price_asc":
                    processedCruises.sort((a, b) => a.price - b.price);
                    break;
                case "price_desc":
                    processedCruises.sort((a, b) => b.price - a.price);
                    break;
                case "duration_desc":
                    processedCruises.sort((a, b) => b.duration - a.duration);
                    break;
                default:
                    processedCruises.sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    );
            }
        }

        const totalDocs = processedCruises.length;
        const totalPages = Math.ceil(totalDocs / pageLimit);

        const paginatedCruises = processedCruises.slice(
            skip,
            skip + pageLimit
        );

        res.status(200).json({
            success: true,
            count: paginatedCruises.length,
            total: totalDocs,
            totalPages,
            currentPage,
            data: paginatedCruises
        });
    } catch (err) {
        next(err);
    }
};

export const getCruiseDetail = async (req, res, next) => {
    try {
        const { slug } = req.params;
        // Cabins đã nằm sẵn trong data trả về
        const cruise = await Cruise.findOne({ slug: slug });

        if (!cruise) return next(createError(404, "cruise not found"));

        res.status(200).json({
            success: true,
            data: cruise
        });
    } catch (err) {
        next(err);
    }
};

export const getAdminCruises = async (req, res, next) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;

        const { keyword, isActive } = req.query;
        const query = {};

        if (keyword) {
            const regex = new RegExp(keyword.split(" ").join(".*"), "i");
            query.$or = [
                { title: regex },
                { city: regex }
            ];
        }

        if (isActive === 'true') query.isActive = true;
        if (isActive === 'false') query.isActive = false;

        const totalDocs = await Cruise.countDocuments(query);

        if (skip >= totalDocs && totalDocs > 0) {
            return res.status(200).json({
                success: true,
                data: [],
                total: totalDocs,
                currentPage: page,
                message: "Page exceeds total records"
            });
        }

        const cruises = await Cruise.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            count: cruises.length,
            total: totalDocs,
            totalPages: Math.ceil(totalDocs / limit),
            currentPage: page,
            data: cruises
        });
    } catch (err) {
        next(err);
    }
};

export const getCruiseTypes = async (req, res, next) => {
    try {
        // MongoDB Aggregation to group by 'cruiseType' and count them
        const types = await Cruise.aggregate([
            {
                $group: {
                    _id: "$cruiseType", // Group by the field 'cruiseType'
                    count: { $sum: 1 }, // Count how many docs match
                    thumbnail: { $first: "$thumbnail" } // Optional: Grab the first image as a thumbnail
                }
            },
            {
                $sort: { count: -1 } // Sort by most popular
            }
        ]);

        res.status(200).json({
            success: true,
            data: types
        });
    } catch (err) {
        next(err);
    }
};


export const updateCruise = async (req, res, next) => {
    try {
        const { id } = req.params;

        // 1. Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createError(400, "Invalid cruise ID format"));
        }

        // 2. Lấy dữ liệu từ Body
        const {
            title, cruiseType, duration, price,
            city, isActive, amenities, itinerary,
            photos, description, additionalServices,
            departureTime, launchedOn, faq,
            cabins // [NEW] Mảng cabins
        } = req.body;

        const updateData = {};

        // 3. Mapping & Validation cơ bản
        if (title) updateData.title = title;
        if (city) updateData.city = city;
        if (cruiseType) updateData.cruiseType = cruiseType;
        if (description) updateData.description = description;
        if (isActive !== undefined) updateData.isActive = isActive;

        if (duration) updateData.duration = Number(duration);

        // Date Fields
        if (departureTime && dayjs(departureTime).isValid()) updateData.departureTime = new Date(departureTime);
        if (launchedOn && dayjs(launchedOn).isValid()) updateData.launchedOn = new Date(launchedOn);

        // Arrays
        if (Array.isArray(amenities)) updateData.amenities = amenities;
        if (Array.isArray(itinerary)) updateData.itinerary = itinerary;
        if (Array.isArray(additionalServices)) updateData.additionalServices = additionalServices;
        if (Array.isArray(faq)) updateData.faq = faq;

        if (Array.isArray(photos)) {
            updateData.photos = photos;
            if (photos.length > 0) updateData.thumbnail = photos[0];
        }

        // --- 4. LOGIC QUAN TRỌNG: CẬP NHẬT CABINS & GIÁ ---
        if (Array.isArray(cabins)) {
            // Thay thế toàn bộ mảng cabins bằng mảng mới từ client
            updateData.cabins = cabins;

            // Tự động tính lại giá Min Price của tàu dựa trên cabin rẻ nhất
            // Nếu không có cabin nào, giữ nguyên giá user nhập (hoặc giá cũ)
            updateData.price = calculateMinPrice(cabins, price);
        } else if (price !== undefined) {
            // Trường hợp user chỉ update giá thủ công mà không sửa cabin
            updateData.price = Number(price);
        }

        // 5. Thực hiện Update
        const updatedCruise = await Cruise.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedCruise) return next(createError(404, "cruise not found"));

        res.status(200).json({
            success: true,
            message: "cruise updated successfully",
            data: updatedCruise
        });

    } catch (err) {
        if (err.name === 'ValidationError') return next(createError(400, err.message));
        next(err);
    }
};


export const deleteCruise = async (req, res, next) => {
    try {
        const cruiseId = req.params.id;

        const deletedCruise = await Cruise.findByIdAndDelete(cruiseId);
        if (!deletedCruise) return next(createError(404, "cruise not found"));

        await Cabin.deleteMany({ cruiseId: cruiseId });

        res.status(200).json({
            success: true,
            message: "cruise and associated cabins deleted successfully"
        });
    } catch (err) {
        next(err);
    }
};


export const updateCabin = async (req, res, next) => {
    try {
        const { id } = req.params; // Đây là ID của Template trong bảng Cabins
        if (!mongoose.Types.ObjectId.isValid(id)) return next(createError(400, "Invalid Template ID"));

        // Chỉ cho phép update thông tin của Template
        const updateData = { ...req.body };
        // [FIX]: Bỏ logic update giá cruise, vì Template độc lập với cruise

        const updatedTemplate = await Cabin.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedTemplate) return next(createError(404, "Cabin Template not found"));

        res.status(200).json({
            success: true,
            message: "Cabin Template updated successfully",
            data: updatedTemplate
        });
    } catch (err) {
        next(err);
    }
};

export const deleteCabin = async (req, res, next) => {
    try {
        // [FIX]: Chỉ xóa Template khỏi thư viện
        const deleted = await Cabin.findByIdAndDelete(req.params.id);
        if (!deleted) return next(createError(404, "Cabin not found"));

        res.status(200).json({ success: true, message: "Cabin  deleted" });
    } catch (err) {
        next(err);
    }
};

export const getCabinTemplates = async (req, res, next) => {
    try {
        const templates = await Cabin.find({ cruiseId: null }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: templates.length,
            data: templates
        });
    } catch (err) {
        next(err);
    }
};