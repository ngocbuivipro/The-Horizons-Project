import Room from "../../models/hotel/Room.js";
import Hotel from "../../models/hotel/Hotel.js";
import {createError} from "../../utils/error.js";

export const createRoom =  async (req, res, next) => {
    try {
        const {
            RoomType,
            hotel,
            price,
            maxPeople,
            services,
            facilities,
            description,
            photos,
            priceExtra,
            quantity,
            availabilityRules
        } = req.body;

        if (!RoomType) return res.json({ success: false, message: "RoomType is required" });
        if (!hotel) return res.json({ success: false, message: "Hotel is required" });
        if (!price) return res.json({ success: false, message: "Price is required" });
        if (!maxPeople) return res.json({ success: false, message: "MaxPeople is required" });
        if (!services) return res.json({ success: false, message: "Services is required" });
        if (!facilities) return res.json({ success: false, message: "Facilities is required" });

        // Validate date range for availability rules
        if (availabilityRules && availabilityRules.length > 0) {
            for (const rule of availabilityRules) {
                if (new Date(rule.startDate) > new Date(rule.endDate)) {
                    return res.json({ success: false, message: "Availability rule start date must be before end date" });
                }
            }
        }

        const room = new Room({
            RoomType,
            description,
            photos,
            maxPeople,
            services,
            hotel,
            price,
            priceExtra,
            facilities,
            quantity: quantity || 1,
            availabilityRules: availabilityRules || []
        });

        const savedRoom = await room.save();

        const hotelData = await Hotel.findByIdAndUpdate(
            hotel,
            { $push: { roomType: savedRoom } },
            { new: true }
        );

        res.json({
            success: true,
            data: savedRoom,
            dataHotel: hotelData,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
}

export const updateRoom = async (req, res, next) => {
    try {
        const roomId = req.params.id;

        if (!roomId) return res.json({ success: false, message: "Room ID is required" });

        const updateData = {
            RoomType: req.body.RoomType,
            hotel: req.body.hotel,
            price: req.body.price,
            maxPeople: req.body.maxPeople,
            quantity: req.body.quantity,
            description: req.body.description,
            photos: req.body.photos,
            services: req.body.services,
            facilities: req.body.facilities,
            priceExtra: req.body.priceExtra,
            availabilityRules: req.body.availabilityRules
        };

        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        // Validate date range for availability rules
        if (updateData.availabilityRules && updateData.availabilityRules.length > 0) {
            for (const rule of updateData.availabilityRules) {
                if (new Date(rule.startDate) > new Date(rule.endDate)) {
                    return res.json({ success: false, message: "Availability rule start date must be before end date" });
                }
            }
        }

        const result = await Room.findByIdAndUpdate(
            roomId,
            { $set: updateData },
            { new: true }
        );

        if (!result) {
            return res.json({ message: "Room not found", success: false });
        }

        res.json({ success: true, data: result });

    } catch (err) {
        next(err);
    }
};

export const deleteRoom = async (req, res, next) => {
    const hotelIdBody = req.params.hotelId;
    const roomId = req.params.id;
    try {
        const hotelId = await Hotel.findByIdAndUpdate(hotelIdBody,{
            $pull:{roomType:{_id:roomId}}
        });
        if (!hotelId) {
            return res.json({ success: false, message: "No found Hotel" });
        }

        const room = await Room.findByIdAndDelete(roomId);
        if (!room) {
            return next(createError(404, "Room not found"));
        }

        res.status(200).json({ message: "Room deleted successfully.", success: true });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Error in BE" });
    }
};

export const getRoomDetail = async (req, res, next) => {
    try {
        const roomSlug = req.params.slug;

        const room = await Room.findOne({ slug: roomSlug })
            .populate('hotel')
            .populate('services')
            .populate('facilities');

        if (!room) {
            return next(createError(404, "Room not found!"));
        }

        res.status(200).json({
            success: true,
            data: room
        });
    } catch (err) {
        next(err);
    }
};

export const migrateSlugs = async (req, res) => {
    try {
        console.log("Starting slug migration...");
        const rooms = await Room.find({});

        for (const room of rooms) {
            if (!room.slug) {
                room.slug = undefined;
                await room.save();
                console.log(`Updated slug for room: ${room.RoomType} -> ${room.slug}`);
            }
        }
        console.log("Slug migration completed!");
        if (res) {
            res.json({ message: "Migration completed!" });
        }
    } catch (error) {
        console.error("Error during slug migration:", error);
        if (res) {
            res.status(500).json({ error: error.message });
        }
    }
};

export const getAllRooms = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [rooms, total] = await Promise.all([
            Room.find({})
                .select('-__v')
                .populate({
                    path: 'services',
                    select: 'name icon'
                })
                .populate({
                    path: 'hotel',
                    select: 'name city address photos rating cheapestPrice slug'
                })
                .populate({
                    path: 'facilities',
                    select: 'name icon'
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            Room.countDocuments({})
        ]);

        res.json({
            success: true,
            count: rooms.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: rooms
        });
    } catch (err) {
        next(err);
    }
};