import Hotel from "../../models/hotel/Hotel.js";
import Room from "../../models/hotel/Room.js";
import {createError} from "../../utils/error.js";

export const getAdminHotels = async (req, res, next) => {
    try {
        // --- 1. LẤY THAM SỐ TỪ URL ---
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10; // FE đang để limit 10
        const skip = (page - 1) * limit;

        const {
            minPrice, maxPrice,
            sort,
            city,
            type,
            search
        } = req.query;

        // --- 2. XÂY DỰNG QUERY LỌC ---
        // SECURE BY DEFAULT: Public users should only see visible hotels.
        const query = { };

        // Tìm theo tên
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        // Tìm theo thành phố (Xử lý logic Dropdown "All Cities")
        if (city && city.trim() !== "") {
            query.city = city.trim();
        }

        // Tìm theo loại
        if (type) {
            query.type = { $regex: type, $options: "i" };
        }

        // Lọc theo giá
        if (minPrice || maxPrice) {
            query.cheapestPrice = {};
            if (minPrice) query.cheapestPrice.$gte = Number(minPrice);
            if (maxPrice) query.cheapestPrice.$lte = Number(maxPrice);
        }

        // --- 3. XỬ LÝ SẮP XẾP ---
        let sortOptions = { createdAt: -1 };

        if (sort) {
            switch (sort) {
                case "price_asc": sortOptions = { cheapestPrice: 1 }; break;
                case "price_desc": sortOptions = { cheapestPrice: -1 }; break;
                case "oldest": sortOptions = { createdAt: 1 }; break;
                case "newest": sortOptions = { createdAt: -1 }; break;
                default: break;
            }
        }

        // --- 4. THỰC THI QUERY (TỐI ƯU HÓA) ---
        const [hotels, total] = await Promise.all([
            Hotel.find(query)
                // OPTIMIZATION 1: Projection - Loại bỏ trường nặng
                .select("-description -policy -updatedAt -__v")

                // OPTIMIZATION 2: Populate chọn lọc (Chỉ lấy field cần thiết)
                .populate({
                    path: "services",
                    select: "name icon" // Chỉ lấy tên và icon service
                })
                .populate({
                    path: "roomType",
                    select: "RoomType" // Chỉ lấy tên loại phòng để hiển thị Tag
                })

                // Sort & Pagination
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)

                // OPTIMIZATION 3: Lean - Chuyển về Object thuần (Nhanh hơn Mongoose Doc)
                .lean(),

            // Query đếm tổng số song song
            Hotel.countDocuments(query)
        ]);

        // --- 5. TRẢ VỀ KẾT QUẢ ---
        res.status(200).json({
            success: true,
            count: hotels.length,
            total: total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: hotels
        });

    } catch (err) {
        console.error("Error getAllHotels:", err);
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: err.message
        });
    }
};

/**
 * @swagger
 * tags:
 * name: Hotels
 * description: Hotel management API
 */
export const getAllHotelNames = async (req, res, next) => {
    try {
        const hotels = await Hotel.find({ isVisible: true }) // Only get visible/active hotels
            .select("_id name cheapestPrice services") // <--- ONLY get fields you need for the form
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: hotels
        });
    } catch (err) {
        next(err);
    }
};
// --- 1. CREATE HOTEL ---
export const createHotel = async (req, res, next) => {
    try {
        const {
            name, type, city, address, photos, description,
            services, roomType, cheapestPrice, checkIn, checkOut,
            policy, isVisible, stars, coordinates
        } = req.body;

        // Validations
        if (!name) return res.json({ success: false, message: "Name cannot be empty" });
        if (!type) return res.json({ success: false, message: "Type cannot be empty" });
        if (!city) return res.json({ success: false, message: "City cannot be empty" });
        if (!address) return res.json({ success: false, message: "Address cannot be empty" });
        if (roomType.length === 0) return res.json({ success: false, message: "At least one room type is required" });
        if (!cheapestPrice || cheapestPrice < 0) return res.json({ success: false, message: "Invalid price" });
        if (!checkIn) return res.json({ success: false, message: "Check-in time is required" });
        if (!checkOut) return res.json({ success: false, message: "Check-out time is required" });

        // Validate Stars (0-5)
        let validStars = 0;
        if (stars) {
            validStars = Number(stars);
            if (validStars < 0 || validStars > 5) {
                return res.json({ success: false, message: "Star rating must be between 0 and 5" });
            }
        }

        const data = new Hotel({
            name, type, city, address, photos, description,
            services, policy, cheapestPrice, checkIn, checkOut,
            isVisible: isVisible !== undefined ? isVisible : true,
            stars: validStars,
            coordinates: coordinates || { lat: 21.028511, lng: 105.854444 }
        });

        await data.save();

        // Create Rooms and Link to Hotel
        for(let i = 0; i < roomType.length; i++){
            const dataRoom = {
                RoomType: roomType[i],
                services: services || [],
                hotel: data._id,
                price: cheapestPrice
            }
            const room = new Room(dataRoom)
            await room.save();
            await Hotel.updateOne(
                { _id: data._id },
                { $push: { roomType: room._id } }
            );
        }

        const newData = await Hotel.findById(data._id);
        res.json({ success: true, data: newData });

    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: "Error in creating Hotel" });
    }
}

// --- 2. GET ALL HOTELS (PUBLIC) ---
export const getAllHotels = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const {
            minPrice, maxPrice,
            sort, city, type, search,
            stars // <--- Get stars from Query
        } = req.query;

        // Query Builder
        const query = { isVisible: true };

        if (search) query.name = { $regex: search, $options: "i" };
        if (city && city.trim() !== "") query.city = city.trim();
        if (type) query.type = { $regex: type, $options: "i" };

        // Filter by Stars
        if (stars) {
            query.stars = Number(stars);
        }

        if (minPrice || maxPrice) {
            query.cheapestPrice = {};
            if (minPrice) query.cheapestPrice.$gte = Number(minPrice);
            if (maxPrice) query.cheapestPrice.$lte = Number(maxPrice);
        }

        // Sorting
        let sortOptions = { createdAt: -1 };
        if (sort) {
            switch (sort) {
                case "price_asc": sortOptions = { cheapestPrice: 1 }; break;
                case "price_desc": sortOptions = { cheapestPrice: -1 }; break;
                case "oldest": sortOptions = { createdAt: 1 }; break;
                case "newest": sortOptions = { createdAt: -1 }; break;
                case "stars_desc": sortOptions = { stars: -1 }; break; // Sort by stars high->low
                case "stars_asc": sortOptions = { stars: 1 }; break;   // Sort by stars low->high
                default: break;
            }
        }

        const [hotels, total] = await Promise.all([
            Hotel.find(query)
                .select("-description -policy -updatedAt -__v") // stars included by default
                .populate({ path: "services", select: "name icon" })
                .populate({ path: "roomType", select: "RoomType" })
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean(),
            Hotel.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            count: hotels.length,
            total: total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: hotels
        });

    } catch (err) {
        console.error("Error getAllHotels:", err);
        return res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

// --- 3. GET ADMIN HOTELS ---

// --- 4. UPDATE HOTEL ---
export const updateHotel = async (req, res, next) => {
    try {
        const hotelId = req.body._id;
        const hotel = await Hotel.findById(hotelId);

        if (!hotel) {
            return res.json({ success: false, message: "No Hotel found with id " + hotelId });
        }

        const newRoomTypeNames = req.body.roomType || [];

        const existingRooms = await Room.find({ _id: { $in: hotel.roomType } }).lean();
        const existingRoomNames = existingRooms.map(room => room.RoomType);

        const roomsToAdd = newRoomTypeNames.filter(name => !existingRoomNames.includes(name));
        const roomsToRemove = existingRoomNames.filter(name => !newRoomTypeNames.includes(name));

        if (roomsToRemove.length > 0) {
            const roomsToDelete = existingRooms.filter(room => roomsToRemove.includes(room.RoomType));
            const idsToDelete = roomsToDelete.map(room => room._id);
            if (idsToDelete.length > 0) {
                await Room.deleteMany({ _id: { $in: idsToDelete } });
            }
        }

        // 4. Create new rooms for the new names
        const newRoomDocs = [];
        if (roomsToAdd.length > 0) {
            for (const roomName of roomsToAdd) {
                const newRoom = new Room({
                    RoomType: roomName,
                    hotel: hotelId,
                    price: req.body.cheapestPrice || hotel.cheapestPrice, // Use new price or fallback to old
                    services: req.body.services || hotel.services,
                });
                const savedRoom = await newRoom.save();
                newRoomDocs.push(savedRoom);
            }
        }

        const finalRoomIds = [
            ...existingRooms.filter(room => !roomsToRemove.includes(room.RoomType)).map(room => room._id),
            ...newRoomDocs.map(room => room._id)
        ];

        req.body.roomType = finalRoomIds;

        // Handle Service Updates for Rooms
        const oldServices = hotel.services.map((service) => service.toString());
        const newServices = req.body.services || [];
        const servicesToAdd = newServices.filter((service) => !oldServices.includes(service));
        const servicesToRemove = oldServices.filter((service) => !newServices.includes(service));
        const roomIds = hotel.roomType;

        if (servicesToAdd.length > 0) {
            await Room.updateMany({ _id: { $in: roomIds } }, { $addToSet: { services: { $each: servicesToAdd } } });
        }
        if (servicesToRemove.length > 0) {
            await Room.updateMany({ _id: { $in: roomIds } }, { $pull: { services: { $in: servicesToRemove } } });
        }


        if (req.body.stars) {
            if (req.body.stars < 0 || req.body.stars > 5) {
                return res.json({ success: false, message: "Star rating must be between 0 and 5" });
            }
        }

        const updatedHotel = await Hotel.findByIdAndUpdate(
            hotelId,
            { $set: req.body },
            { new: true }
        ).populate('services').populate('policy').populate('roomType');

        if (!updatedHotel) {
            return res.json({ success: false, message: "Update failed" });
        }

        res.status(200).json({ success: true, data: updatedHotel });
    } catch (err) {
        next(err);
    }
}

// --- 5. DELETE HOTEL ---
export const deleteHotel = async (req, res, next) => {
    try {
        const deletedHotel = await Hotel.findByIdAndDelete(req.params.id)
        if (!deletedHotel) {
            return res.status(404).json({ success: false, message: "No Hotel found" });
        }

        const roomsToDelete = await Room.find({ hotel: req.params.id  });
        if(roomsToDelete.length > 0){
            await Room.deleteMany({ hotel: req.params.id  });
        }

        res.status(200).json({ success: true, message: "Hotel and Rooms deleted" });

    } catch (err) {
        res.json({ success: false, message: "Error in BE" });
    }
}

// --- 6. GET HOTEL DETAIL ---
export const getHotelDetail = async (req, res, next) => {
    try {
        const hotel = await Hotel.findOne({ slug: req.params.slug })
            .select('-__v -createdAt -updatedAt')
            .populate({
                path: 'roomType',
                select: 'RoomType price priceExtra photos maxPeople services facilities availabilityRules',
                populate: { path: 'services facilities', select: 'name icon' }
            })
            .populate({ path: 'services', select: 'name icon' })
            .populate({ path: 'policy', select: 'name type icon' })
            .lean();

        if (!hotel) {
            return next(createError(404, "Hotel not found!"));
        }

        res.status(200).json({ success: true, data: hotel });
    } catch (err) {
        next(err);
    }
};

// --- 7. TOGGLE VISIBILITY ---
export const toggleVisibilityHotel = async (req, res, next) => {
    try {
        const { id } = req.params;
        const hotel = await Hotel.findById(id);
        if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found" });

        hotel.isVisible = !hotel.isVisible;
        await hotel.save();

        res.status(200).json({
            success: true,
            message: `Hotel is now ${hotel.isVisible ? 'Visible' : 'Hidden'}`,
            data: { _id: hotel._id, isVisible: hotel.isVisible }
        });
    } catch (err) {
        next(err);
    }
};

// --- OTHER UTILS ---
export const getHotel = async (req, res, next) => {
    try {
        const hotel = await Hotel.findById(req.params.id)
        if (!hotel) {
            return res.status(404).json({ message: "No Hotel found" });
        }
        res.status(200).json(hotel);
    } catch (err) {
        next(err);
    }
}

export const deleteAllHotels = async (req, res, next) => {
    try {
        const hotelsResult = await Hotel.deleteMany({});
        const roomsResult = await Room.deleteMany({});

        res.status(200).json({
            success: true,
            message: "All deleted",
            data: { hotels: hotelsResult.deletedCount, rooms: roomsResult.deletedCount }
        });
    } catch (err) {
        next(err);
    }
};

// --- GET RECOMMENDED HOTELS ---
export const getRecommendedHotels = async (req, res, next) => {
    try {
        const { city } = req.query;
        const limit = 4; // Show 4 items per row

        const query = { isVisible: true };

        // If a city is provided, filter by it. Case-insensitive.
        if (city) {
            query.city = { $regex: city, $options: "i" };
        }

        // Fetch hotels, maybe sort by rating or just newest
        const hotels = await Hotel.find(query)
            .select("-description -policy -updatedAt -__v") // Lightweight selection
            .populate({ path: "roomType", select: "RoomType" })
            .limit(limit)
            .lean();

        res.status(200).json({
            success: true,
            data: hotels
        });
    } catch (err) {
        next(err);
    }
};
