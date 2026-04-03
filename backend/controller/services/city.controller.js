import City from "../../models/hotel/City.js";

export const createCity = async (req, res) => {
    try {
        const newCity = new City(req.body);
        await newCity.save();
        res.status(200).json({ success: true, data: newCity });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getAllCities = async (req, res) => {
    try {
        const cities = await City.find();
        res.status(200).json({ success: true, data: cities });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteCity = async (req, res) => {
    try {
        await City.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "City deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};