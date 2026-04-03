import BoardingArrive from "../../models/bus/BoardingArrive.js";

export const createBoardingPoint = async (req, res, next) => {
    try {
        const { city, name, address, type } = req.body;

        // Validate required fields
        if (!city) return res.status(400).json({ success: false, message: "City is required" });
        if (!name) return res.status(400).json({ success: false, message: "Station Name is required" });
        if (!address) return res.status(400).json({ success: false, message: "Address is required" });

        // Check for duplicate boarding points in the same city
        const existingPoint = await BoardingArrive.findOne({
            city: { $regex: new RegExp(`^${city.trim()}$`, "i") },
            name: { $regex: new RegExp(`^${name.trim()}$`, "i") }
        });

        if (existingPoint) {
            return res.status(400).json({ success: false, message: "This boarding point already exists in this city." });
        }

        const newPoint = new BoardingArrive({
            city: city.trim(),
            name: name.trim(),
            address: address.trim(),
            type: type || "BOTH"
        });

        await newPoint.save();

        res.status(201).json({
            success: true,
            message: "Boarding point created successfully",
            data: newPoint
        });
    } catch (err) {
        next(err);
    }
};

export const updateBoardingPoint = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { city, name, address, type, isActive } = req.body;

        const updateData = {};
        if (city) updateData.city = city.trim();
        if (name) updateData.name = name.trim();
        if (address) updateData.address = address.trim();
        if (type) updateData.type = type;
        if (isActive !== undefined) updateData.isActive = isActive;

        const updatedPoint = await BoardingArrive.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!updatedPoint) return res.status(404).json({ success: false, message: "Point not found" });

        res.status(200).json({ success: true, message: "Updated successfully", data: updatedPoint });
    } catch (err) {
        next(err);
    }
};

export const deleteBoardingPoint = async (req, res, next) => {
    try {
        await BoardingArrive.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Deleted successfully" });
    } catch (err) {
        next(err);
    }
};

export const getAllBoardingPoints = async (req, res, next) => {
    try {
        const { city, search } = req.query;
        const query = { isActive: true };

        if (city) query.city = { $regex: city, $options: "i" };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { address: { $regex: search, $options: "i" } }
            ];
        }

        const points = await BoardingArrive.find(query).sort({ city: 1, name: 1 });

        res.status(200).json({ success: true, count: points.length, data: points });
    } catch (err) {
        next(err);
    }
};
