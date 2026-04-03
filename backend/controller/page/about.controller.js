import About from "../../models/page/About.js";

export const getAbout = async (req, res) => {
    try {
        let about = await About.findOne().populate("lastEditedBy", "username");

        if (!about) {
            about = new About({
                title: "About Us",
                content: "<p>Welcome...</p>",
                photos: [],
                features: [],
                stats: [],

                // --- MẶC ĐỊNH CHO HIGHLIGHTS (Theo ảnh của bạn) ---
                highlights: [
                    {
                        icon: "map",
                        color: "red",
                        text: "Clients navigate their journeys, whether for travel or educational purposes, primarily in Canada, the U.S., and the U.K"
                    },
                    {
                        icon: "star", // hoặc icon sparkle
                        color: "green",
                        text: "Provides a range of services from immigration advice to study-abroad support and vacation planning."
                    }
                ]
            });
            await about.save();
        }

        res.status(200).json({ success: true, data: about });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateAbout = async (req, res) => {
    try {
        // Lấy highlights từ req.body
        const { title, content, photos, features, stats, highlights } = req.body;
        const adminId = req.user?._id || req.admin?._id;

        if (!content) return res.status(400).json({ success: false, message: "Nội dung trống" });

        let about = await About.findOne();
        const updateData = {
            title, content,
            photos: photos || [],
            features: features || [],
            stats: stats || [],
            highlights: highlights || [], // Cập nhật highlights
            lastEditedBy: adminId
        };

        if (about) {
            Object.assign(about, updateData);
            await about.save();
        } else {
            about = new About(updateData);
            await about.save();
        }

        const populatedAbout = await About.findById(about._id).populate("lastEditedBy", "username");
        res.status(200).json({ success: true, message: "Cập nhật thành công!", data: populatedAbout });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};