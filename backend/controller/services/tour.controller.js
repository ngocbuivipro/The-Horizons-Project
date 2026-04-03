import Tour from "../../models/tour/Tour.js";
import {createError} from "../../utils/error.js";

const validateDateRanges = (rules, typeName) => {
    if (rules && rules.length > 0) {
        for (const rule of rules) {
            const start = rule.start ? new Date(rule.start) : new Date(rule.startDate);
            const end = rule.end ? new Date(rule.end) : new Date(rule.endDate);

            if (start > end) {
                return `${typeName}: Start date must be before end date`;
            }
        }
    }
    return null;
};

export const createTour = async (req, res, next) => {
    try {
        const {
            name,
            city,
            tourType,
            duration,
            durationText,
            price,
            priceChildren,
            maxGroupSize,
            images,
            description,
            itinerary,
            services,
            policy,
            priceExtra,
            availabilityRules,
            featured,
            isVisible
        } = req.body;

        if (!name) return res.json({success: false, message: "Tour name is required"});
        if (!city) return res.json({success: false, message: "City is required"});
        if (!tourType) return res.json({success: false, message: "Tour type is required"});
        if (!duration) return res.json({success: false, message: "Duration is required"});
        if (!price) return res.json({success: false, message: "Price is required"});
        if (!maxGroupSize) return res.json({success: false, message: "Max group size is required"});

        const priceError = validateDateRanges(priceExtra, "Price Extra");
        if (priceError) return res.json({success: false, message: priceError});

        const availError = validateDateRanges(availabilityRules, "Availability Rules");
        if (availError) return res.json({success: false, message: availError});

        const newTour = new Tour({
            name,
            city,
            tourType,
            duration,
            durationText,
            price,
            priceChildren: priceChildren || 0,
            maxGroupSize,
            images: images || [],
            description,
            itinerary: itinerary || [],
            services: services || [],
            policy: policy || [],
            priceExtra: priceExtra || [],
            availabilityRules: availabilityRules || [],
            featured: featured || false,
            isVisible: isVisible !== undefined ? isVisible : true
        });

        const savedTour = await newTour.save();

        res.status(200).json({
            success: true,
            message: "Tour created successfully",
            data: savedTour
        });

    } catch (err) {
        next(err);
    }
};

export const updateTour = async (req, res, next) => {
    try {
        const tourId = req.params.id;
        if (!tourId) return res.json({success: false, message: "Tour ID is required"});

        const updateData = {
            name: req.body.name,
            city: req.body.city,
            tourType: req.body.tourType,
            duration: req.body.duration,
            durationText: req.body.durationText,
            price: req.body.price,
            priceChildren: req.body.priceChildren,
            maxGroupSize: req.body.maxGroupSize,
            images: req.body.images,
            description: req.body.description,
            itinerary: req.body.itinerary,
            services: req.body.services,
            policy: req.body.policy,
            featured: req.body.featured,
            isVisible: req.body.isVisible,
            priceExtra: req.body.priceExtra,
            availabilityRules: req.body.availabilityRules
        };

        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        if (updateData.priceExtra) {
            const priceError = validateDateRanges(updateData.priceExtra, "Price Extra");
            if (priceError) return res.json({success: false, message: priceError});
        }

        if (updateData.availabilityRules) {
            const availError = validateDateRanges(updateData.availabilityRules, "Availability Rules");
            if (availError) return res.json({success: false, message: availError});
        }

        const updatedTour = await Tour.findByIdAndUpdate(
            tourId,
            {$set: updateData},
            {new: true, runValidators: true}
        );

        if (!updatedTour) {
            return res.json({success: false, message: "Tour not found"});
        }

        res.status(200).json({
            success: true,
            message: "Tour updated successfully",
            data: updatedTour
        });

    } catch (err) {
        next(err);
    }
};

export const deleteTour = async (req, res, next) => {
    try {
        const deletedTour = await Tour.findByIdAndDelete(req.params.id);
        if (!deletedTour) return res.json({success: false, message: "Tour not found"});

        res.status(200).json({success: true, message: "Tour deleted successfully"});
    } catch (err) {
        next(err);
    }
};

export const getTourDetail = async (req, res, next) => {
    try {
        const tour = await Tour.findOne({slug: req.params.slug})
            .populate({path: 'services', select: 'name icon'})
            .populate({ path: 'policy', select: 'name type icon' })
            .lean();

        if (!tour) return next(createError(404, "Tour not found"));

        res.status(200).json({success: true, data: tour});
    } catch (err) {
        next(err);
    }
};

export const getAdminTours = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const {search, sort, minPrice, maxPrice, city, duration, isVisible} = req.query;

        const query = {};

        if (search) query.name = {$regex: search, $options: "i"};
        if (city) query.city = {$regex: city, $options: "i"};
        if (duration) query.duration = Number(duration);

        if (isVisible !== undefined && isVisible !== "") {
            query.isVisible = isVisible === 'true';
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        let sortOptions = {createdAt: -1};
        if (sort) {
            switch (sort) {
                case "price_asc":
                    sortOptions = {price: 1};
                    break;
                case "price_desc":
                    sortOptions = {price: -1};
                    break;
                case "oldest":
                    sortOptions = {createdAt: 1};
                    break;
                case "newest":
                    sortOptions = {createdAt: -1};
                    break;
                case "duration_asc":
                    sortOptions = {duration: 1};
                    break;
                case "duration_desc":
                    sortOptions = {duration: -1};
                    break;
                default:
                    break;
            }
        }

        const [tours, total] = await Promise.all([
            Tour.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean(),
            Tour.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            count: tours.length,
            total: total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: tours
        });
    } catch (err) {
        next(err);
    }
};

export const toggleTourVisibility = async (req, res, next) => {
    try {
        const tour = await Tour.findById(req.params.id);
        if (!tour) return res.json({success: false, message: "Tour not found"});

        tour.isVisible = !tour.isVisible;
        await tour.save();

        res.status(200).json({success: true, message: "Tour visibility updated", data: tour});
    } catch (err) {
        next(err);
    }
};

export const getAllTours = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const {city, minPrice, maxPrice, search, sort, duration} = req.query;

        const query = {isVisible: true};

        if (search) query.name = {$regex: search, $options: "i"};
        if (city && city.trim() !== "") query.city = city.trim();

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (duration) query.duration = Number(duration);

        let sortOptions = {createdAt: -1};
        if (sort) {
            switch (sort) {
                case "price_asc":
                    sortOptions = {price: 1};
                    break;
                case "price_desc":
                    sortOptions = {price: -1};
                    break;
                case "oldest":
                    sortOptions = {createdAt: 1};
                    break;
                case "newest":
                    sortOptions = {createdAt: -1};
                    break;
                default:
                    break;
            }
        }

        const [tours, total] = await Promise.all([
            Tour.find(query)
                .select("-description -itinerary -updatedAt -__v")
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean(),
            Tour.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            count: tours.length,
            total: total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: tours
        });

    } catch (err) {
        next(err);
    }
};

export const calculateBookingTourPrice = async (req, res) => {
    try {
        const {tourId, checkIn, adults, children, couponCode} = req.body;

        if (!tourId || !checkIn) {
            return res.status(400).json({success: false, message: "Missing Tour or check-in information."});
        }

        const countAdults = Number(adults) || 1;
        const countChildren = Number(children) || 0;
        const startDate = new Date(checkIn);
        startDate.setUTCHours(0, 0, 0, 0);

        const tour = await Tour.findById(tourId);
        if (!tour) return res.status(404).json({success: false, message: "Tour not found."});

        if (tour.availabilityRules?.length > 0) {
            const isBlocked = tour.availabilityRules.some(rule => {
                const ruleStart = new Date(rule.startDate);
                const ruleEnd = new Date(rule.endDate);
                ruleStart.setUTCHours(0, 0, 0, 0);
                ruleEnd.setUTCHours(0, 0, 0, 0);
                return rule.isBlocked && (startDate >= ruleStart && startDate <= ruleEnd);
            });

            if (isBlocked) {
                return res.status(400).json({
                    success: false,
                    message: `Tour temporarily unavailable on ${startDate.toLocaleDateString('vi-VN')}`
                });
            }
        }

        let unitPriceAdult = Number(tour.price);
        let unitPriceChild = Number(tour.priceChildren || tour.price);
        let note = "Standard Rate";

        if (tour.priceExtra?.length > 0) {
            const matchedExtra = tour.priceExtra.find(extra => {
                const extraStart = new Date(extra.start);
                const extraEnd = new Date(extra.end);
                extraStart.setUTCHours(0, 0, 0, 0);
                extraEnd.setUTCHours(0, 0, 0, 0);
                return startDate >= extraStart && startDate <= extraEnd;
            });

            if (matchedExtra) {
                unitPriceAdult = Number(matchedExtra.price);
                note = `Special Rate (${matchedExtra.title || 'Holiday'})`;
            }
        }

        const totalAdult = unitPriceAdult * countAdults;
        const totalChild = unitPriceChild * countChildren;
        const totalPriceOriginal = totalAdult + totalChild;

        let discountInfo = {
            discountAmount: 0,
            finalPrice: totalPriceOriginal,
            message: null
        };

        if (couponCode) {
            try {
                const result = await calculateDiscount(couponCode, totalPriceOriginal);
                discountInfo = {
                    discountAmount: result.discountAmount,
                    finalPrice: result.finalPrice,
                    couponId: result.couponId,
                    message: "Valid coupon code!"
                };
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message,
                    data: {originalPrice: totalPriceOriginal, finalPrice: totalPriceOriginal}
                });
            }
        }

        return res.status(200).json({
            success: true,
            data: {
                tourName: tour.title,
                startDate: startDate,
                guests: {adults: countAdults, children: countChildren},
                unitPriceAdult,
                unitPriceChild,
                totalAdult,
                totalChild,
                originalPrice: totalPriceOriginal,
                couponApplied: !!couponCode,
                discountAmount: discountInfo.discountAmount,
                finalPrice: discountInfo.finalPrice,
                couponMessage: discountInfo.message,
                note
            }
        });

    } catch (error) {
        return res.status(500).json({success: false, message: error.message});
    }
};
