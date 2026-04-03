import Bus from "../../models/bus/Bus.js";
import {createError} from "../../utils/error.js";
import BoardingArrive from "../../models/bus/BoardingArrive.js";
import dayjs from "dayjs";

// --- VALIDATION HELPER ---
const validateDateRanges = (rules, typeName) => {
    if (rules && rules.length > 0) {
        for (const rule of rules) {
            // Support both field names in case of schema inconsistency
            const start = rule.startDate ? new Date(rule.startDate) : new Date(rule.start);
            const end = rule.endDate ? new Date(rule.endDate) : new Date(rule.end);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return `${typeName}: Invalid date format`;
            }

            if (start > end) {
                return `${typeName}: Start date must be before end date`;
            }
        }
    }
    return null;
};

// Helper: Kiểm tra danh sách ID có tồn tại trong DB không
const validateBoardingIds = async (ids) => {
    if (!ids || ids.length === 0) return true; // Cho phép rỗng

    // Đếm số lượng ID hợp lệ trong DB
    const count = await BoardingArrive.countDocuments({
        _id: {$in: ids},
        isActive: true
    });

    // Nếu số lượng tìm thấy != số lượng gửi lên => Có ID sai
    return count === ids.length;
};


// Helper: Calculate effective price (Check holidays)
const calculateEffectivePrice = (bus, queryDate = null) => {
    let finalPrice = bus.price;
    let note = "Standard Price";

    // If user searches for a specific date, use that date; otherwise, use the bus departure date
    const checkDate = queryDate ? new Date(queryDate) : new Date(bus.departureTime);

    if (bus.priceExtra && bus.priceExtra.length > 0) {
        const matchedExtra = bus.priceExtra.find(extra => {
            const start = new Date(extra.startDate);
            const end = new Date(extra.endDate);
            // Reset time to 0 to compare by date
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            return checkDate >= start && checkDate <= end;
        });

        if (matchedExtra) {
            finalPrice = matchedExtra.price;
            note = matchedExtra.title;
        }
    }
    return {finalPrice, note};
};

// ==========================================
// CREATE BUS
// ==========================================
export const createBus = async (req, res, next) => {
    try {
        const {
            operator,
            busType,
            cityFrom,
            cityTo,
            departureTime,
            arrivalTime,
            price,
            totalSeats,
            description,
            photos,
            // References
            boardingPoints,
            droppingPoints,
            facilities,
            // Complex fields
            policy,
            priceExtra,
            availabilityRules,
            isActive
        } = req.body;

        // 1. --- Strict Input Validation ---
        if (!operator) return res.json({success: false, message: "Operator name is required"});
        if (!cityFrom || !cityTo) return res.json({success: false, message: "City From and City To are required"});
        if (!departureTime || !arrivalTime) return res.json({
            success: false,
            message: "Departure and Arrival times are required"
        });
        if (!price) return res.json({success: false, message: "Price is required"});
        if (!totalSeats) return res.json({success: false, message: "Total seats is required"});

        // Validate Logic Time
        if (new Date(departureTime) >= new Date(arrivalTime)) {
            return res.json({success: false, message: "Arrival time must be after Departure time"});
        }

        // 2. --- Validate Date Logic (PriceExtra & Availability) ---
        const priceError = validateDateRanges(priceExtra, "Price Extra");
        if (priceError) return res.json({success: false, message: priceError});

        const availError = validateDateRanges(availabilityRules, "Availability Rules");
        if (availError) return res.json({success: false, message: availError});

        if (req.body.boardingPoints) {
            const isValid = await validateBoardingIds(req.body.boardingPoints);
            if (!isValid) return res.json({success: false, message: "Invalid Boarding Point IDs"});
        }

        if (req.body.droppingPoints) {
            const isValid = await validateBoardingIds(req.body.droppingPoints);
            if (!isValid) return res.json({success: false, message: "Invalid Dropping Point IDs"});
        }

        // 4. --- Create Instance ---
        const newBus = new Bus({
            operator,
            busType: busType || "Sleeper",
            cityFrom,
            cityTo,
            photos: photos || [],
            departureTime: new Date(departureTime),
            arrivalTime: new Date(arrivalTime),
            price: Number(price),
            totalSeats: Number(totalSeats),

            boardingPoints: boardingPoints || [],
            droppingPoints: droppingPoints || [],
            facilities: facilities || [],

            policy: policy || [],
            priceExtra: priceExtra || [],
            availabilityRules: availabilityRules || [],

            conditions: description || "",
            isActive: isActive !== undefined ? isActive : true
        });

        const savedBus = await newBus.save();

        res.status(200).json({
            success: true,
            message: "Bus created successfully",
            data: savedBus
        });

    } catch (err) {
        console.error("Create Bus Error:", err);
        next(err);
    }
};

// ==========================================
// 2. UPDATE BUS
// ==========================================
export const updateBus = async (req, res, next) => {
    try {
        const busId = req.params.id;
        if (!busId) return res.json({success: false, message: "Bus ID is required"});

        const updateData = {
            operator: req.body.operator,
            busType: req.body.busType,
            cityFrom: req.body.cityFrom,
            cityTo: req.body.cityTo,
            departureTime: req.body.departureTime,
            arrivalTime: req.body.arrivalTime,
            price: req.body.price,
            totalSeats: req.body.totalSeats,

            photos: req.body.photos,

            boardingPoints: req.body.boardingPoints,
            droppingPoints: req.body.droppingPoints,
            facilities: req.body.facilities,

            policy: req.body.policy,
            conditions: req.body.conditions,

            priceExtra: req.body.priceExtra,
            availabilityRules: req.body.availabilityRules,
            isActive: req.body.isActive
        };

        if (req.body.boardingPoints) {
            const isValid = await validateBoardingIds(req.body.boardingPoints);
            if (!isValid) return res.json({success: false, message: "Invalid Boarding Point IDs"});
        }

        if (req.body.droppingPoints) {
            const isValid = await validateBoardingIds(req.body.droppingPoints);
            if (!isValid) return res.json({success: false, message: "Invalid Dropping Point IDs"});
        }

        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        if (updateData.departureTime && updateData.arrivalTime) {
            if (new Date(updateData.departureTime) >= new Date(updateData.arrivalTime)) {
                return res.json({success: false, message: "Arrival time must be after Departure time"});
            }
        }

        if (updateData.priceExtra) {
            const priceError = validateDateRanges(updateData.priceExtra, "Price Extra");
            if (priceError) return res.json({success: false, message: priceError});
        }

        if (updateData.availabilityRules) {
            const availError = validateDateRanges(updateData.availabilityRules, "Availability Rules");
            if (availError) return res.json({success: false, message: availError});
        }

        // 4. --- Perform Update ---
        const updatedBus = await Bus.findByIdAndUpdate(
            busId,
            {$set: updateData},
            {new: true, runValidators: true}
        );

        if (!updatedBus) {
            return res.json({success: false, message: "Bus not found"});
        }

        res.status(200).json({
            success: true,
            message: "Bus updated successfully",
            data: updatedBus
        });

    } catch (err) {
        console.error("Update Bus Error:", err);
        next(err);
    }
};
// ==========================================
// 3. DELETE BUS
// ==========================================
export const deleteBus = async (req, res, next) => {
    try {
        const deletedBus = await Bus.findByIdAndDelete(req.params.id);
        if (!deletedBus) return res.json({success: false, message: "Bus not found"});

        res.status(200).json({success: true, message: "Bus deleted successfully"});
    } catch (err) {
        next(err);
    }
};

// ==========================================
// 4. GET SINGLE BUS (Client View)
// ==========================================
export const getBusDetail = async (req, res, next) => {
    try {
        const bus = await Bus.findById(req.params.id)
            .populate("boardingPoints")
            .populate("droppingPoints")
            .populate("facilities");

        if (!bus) return next(createError(404, "Bus not found"));

        // Calculate current price (if it is a holiday)
        const {finalPrice, note} = calculateEffectivePrice(bus);

        // Return data with calculated price
        const responseData = {
            ...bus._doc,
            currentPrice: finalPrice,
            priceNote: note
        };

        res.status(200).json({success: true, data: responseData});
    } catch (err) {
        next(err);
    }
};

export const searchBus = async (req, res, next) => {
    try {
        const {
            keyword, cityFrom, cityTo, date,
            minPrice, maxPrice, operators, timeRanges, sort,
            type // Nhận tham số type từ URL (ví dụ: "Sleeper" hoặc "Standard,Sleeper")
        } = req.query;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchDateStr = date || dayjs().format("YYYY-MM-DD");

        // 1. Query DB cơ bản
        const query = { isActive: true };

        if (cityFrom) query.cityFrom = { $regex: cityFrom, $options: "i" };
        if (cityTo) query.cityTo = { $regex: cityTo, $options: "i" };

        if (keyword) {
            const keywordRegex = { $regex: keyword, $options: "i" };
            query.$or = [
                { poName: keywordRegex },
                { cityFrom: keywordRegex },
                { cityTo: keywordRegex }
            ];
        }

        let buses = await Bus.find(query)
            .populate("boardingPoints", "name address city")
            .populate("droppingPoints", "name address city")
            .populate("facilities", "name icon")
            .lean();

        // 2. Map lại ngày giờ (Logic Duration)
        let validBuses = buses.map(bus => {
            const originalDep = new Date(bus.departureTime);
            const originalArr = new Date(bus.arrivalTime);
            const durationMs = originalArr - originalDep;

            const newDepartureDate = new Date(searchDateStr);
            newDepartureDate.setHours(originalDep.getHours(), originalDep.getMinutes(), 0, 0);

            const newArrivalDate = new Date(newDepartureDate.getTime() + durationMs);

            return {
                ...bus,
                departureTime: newDepartureDate.toISOString(),
                arrivalTime: newArrivalDate.toISOString(),
            };
        });

        // 3. --- BỘ LỌC JS ---

        // [FIX QUAN TRỌNG] Lọc Bus Type
        if (type) {
            const typeList = Array.isArray(type) ? type : type.split(',');

            validBuses = validBuses.filter(bus => {
                // Dựa vào JSON bạn gửi: trường trong DB là "busType" chứ không phải "type"
                // Nếu busType là null/undefined, ta coi nó là "Standard"
                const currentBusType = bus.busType || "Standard";

                // Kiểm tra xem danh sách filter có chứa loại xe này không
                return typeList.includes(currentBusType);
            });
        }

        // Lọc Time Ranges
        if (timeRanges) {
            const ranges = Array.isArray(timeRanges) ? timeRanges : timeRanges.split(',');
            if (ranges.length > 0) {
                validBuses = validBuses.filter(bus => {
                    const hour = new Date(bus.departureTime).getHours();
                    return ranges.some(range => {
                        const [start, end] = range.split('-').map(Number);
                        return hour >= start && hour <= end;
                    });
                });
            }
        }

        // Lọc Operators
        if (operators) {
            const operatorList = Array.isArray(operators) ? operators : operators.split(',');
            validBuses = validBuses.filter(bus => operatorList.includes(bus.poName)); // Lưu ý: DB dùng operator hay poName? Trong JSON bạn gửi là "operator": "Thanh", nếu poName ko có thì sửa thành bus.operator
        }

        // [FIX PHỤ] Dựa vào JSON của bạn: trường tên là "operator", không phải "poName"
        // Nếu bộ lọc Operator không chạy, hãy đổi dòng trên thành:
        // validBuses = validBuses.filter(bus => operatorList.includes(bus.operator));


        // Lọc Giá
        if (minPrice || maxPrice) {
            const min = Number(minPrice) || 0;
            const max = Number(maxPrice) || 100000000;
            validBuses = validBuses.filter(bus => bus.price >= min && bus.price <= max);
        }

        // 4. Sorting
        if (sort) {
            switch (sort) {
                case 'price_asc': validBuses.sort((a, b) => a.price - b.price); break;
                case 'price_desc': validBuses.sort((a, b) => b.price - a.price); break;
                case 'time_asc': validBuses.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime)); break;
                case 'time_desc': validBuses.sort((a, b) => new Date(b.departureTime) - new Date(a.departureTime)); break;
                default: validBuses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
            }
        }

        // 5. Pagination
        const totalDocs = validBuses.length;
        const skip = (page - 1) * limit;
        const paginatedBuses = validBuses.slice(skip, skip + limit);

        res.status(200).json({
            success: true,
            count: paginatedBuses.length,
            total: totalDocs,
            totalPages: Math.ceil(totalDocs / limit),
            currentPage: page,
            data: paginatedBuses
        });

    } catch (err) {
        next(err);
    }
};

// ==========================================
export const getAdminBuses = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Lấy các tham số: keyword (chung), operator, isActive, date (để xem lịch ngày nào)
        const { keyword, sort, operator, isActive, date } = req.query;

        //  Build Query
        const query = {};

        // A. Keyword Search (Đồng bộ logic với searchBus)
        // Tìm trong: Biển số, Tên nhà xe, Điểm đi, Điểm đến
        if (keyword) {
            const keywordRegex = { $regex: keyword, $options: "i" };
            query.$or = [
                // { busNumber: keywordRegex }, // Admin thường tìm theo biển số
                { poName: keywordRegex },    // Tên nhà xe (Lưu ý field trong DB là poName hay operator)
                { cityFrom: keywordRegex },
                { cityTo: keywordRegex }
            ];
        }

        // B. Filter Operator & Active
        if (operator) query.poName = { $regex: operator, $options: "i" };
        if (isActive !== undefined && isActive !== "") query.isActive = isActive === 'true';

        // 2. Fetch Data (Lấy TOÀN BỘ kết quả khớp query để xử lý ngày tháng)
        const buses = await Bus.find(query).lean();

        // 3. Post-Processing (Tính toán ngày giờ động - Dynamic Date)
        // Nếu Admin không chọn ngày, mặc định hiển thị lịch của HÔM NAY để dễ quản lý
        const targetDateStr = date || dayjs().format("YYYY-MM-DD");

        let processedBuses = buses.map(bus => {
            // Logic cập nhật ngày tự động (Giống searchBus)
            const originalDep = new Date(bus.departureTime);
            const originalArr = new Date(bus.arrivalTime);

            // Tính duration
            const durationMs = originalArr - originalDep;

            // Set ngày mới dựa trên targetDateStr nhưng giữ nguyên giờ/phút của template
            const newDepartureDate = new Date(targetDateStr);
            newDepartureDate.setHours(originalDep.getHours(), originalDep.getMinutes(), 0, 0);

            const newArrivalDate = new Date(newDepartureDate.getTime() + durationMs);

            return {
                ...bus,
                // Ghi đè hiển thị ngày cũ bằng ngày mới
                departureTime: newDepartureDate.toISOString(),
                arrivalTime: newArrivalDate.toISOString(),
                // Giữ lại id gốc để Admin edit/delete
            };
        });

        // 4. Sorting (Xử lý In-Memory)
        if (sort) {
            switch (sort) {
                case "price_asc":
                    processedBuses.sort((a, b) => a.price - b.price);
                    break;
                case "price_desc":
                    processedBuses.sort((a, b) => b.price - a.price);
                    break;
                case "time_asc":
                    processedBuses.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
                    break;
                case "time_desc":
                    processedBuses.sort((a, b) => new Date(b.departureTime) - new Date(a.departureTime));
                    break;
                case "newest":
                    processedBuses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
                default:
                    // Mặc định xe mới nhất lên đầu
                    processedBuses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
            }
        } else {
            processedBuses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        // 5. Pagination (Manual Slice)
        // Cắt mảng sau khi đã lọc và sort
        const totalDocs = processedBuses.length;
        const paginatedBuses = processedBuses.slice(skip, skip + limit);

        res.status(200).json({
            success: true,
            count: paginatedBuses.length,
            total: totalDocs,
            totalPages: Math.ceil(totalDocs / limit),
            currentPage: page,
            data: paginatedBuses
        });

    } catch (err) {
        next(err);
    }
};

// ==========================================
// 7. GET BUS TYPES
// ==========================================
export const getBusTypes = async (req, res, next) => {
    try {
        const types = await Bus.aggregate([
            {
                $match: { isActive: true }
            },
            {
                $group: {
                    _id: "$busType", // Group by the busType field
                    count: { $sum: 1 }, // Count documents in each group
                    photo: { $first: { $arrayElemAt: ["$photos", 0] } } // Get the first photo for the type
                }
            },
            {
                $project: {
                    _id: 0,
                    type: "$_id",
                    count: 1,
                    photo: 1
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        res.status(200).json({ success: true, data: types });
    } catch (err) {
        next(err);
    }
};
// ==========================================
// 8. TOGGLE BUS STATUS
// ==========================================
export const toggleBusStatus = async (req, res, next) => {
    try {
        const bus = await Bus.findById(req.params.id);
        if (!bus) return res.json({success: false, message: "Bus not found"});

        const updatedBus = await Bus.findByIdAndUpdate(
            req.params.id,
            {isActive: !bus.isActive},
            {new: true}
        );

        res.status(200).json({success: true, message: "Bus status updated", data: updatedBus});
    } catch (err) {
        next(err);
    }
};
