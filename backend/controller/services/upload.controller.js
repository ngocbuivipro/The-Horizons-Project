
import { uploadFromUrl, cloudinaryUtil, uploadMultipleImagesToCloudinary } from "../../utils/cloudinary.util.js";
import cloudinary from "cloudinary";


export const uploadByLink = async (req, res) => {
    try {
        const { imageUrl } = req.body;

        // 1. Validate Input
        if (!imageUrl) {
            return res.json({
                code: 400,
                message: "The image URL cannot be empty."
            });
        }

        // 2. Direct Cloudinary Call (No service file)
        const uploadResult = await cloudinary.uploader.upload(imageUrl, {
            resource_type: "auto", // Good practice: auto-detects image/video
        });

        // 3. Success Response
        return res.json({
            code: 200,
            message: "Upload successful",
            data: uploadResult
        });

    } catch (error) {
        console.error("Upload Error:", error);
        return res.json({
            code: 500, // Use 500 for server errors
            message: "Internal Server Error: " + error.message
        });
    }
};

export const uploadByFiles = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.json({
                success: false,
                message: "No files uploaded."
            });
        }

        const uploadPromises = req.files.map(async (file) => {
            // Upload using the file path provided by Multer
            const result = await cloudinary.uploader.upload(file.path, {
                resource_type: "auto",
                folder: "betel"
            });


            return result;
        });

        // 3. Wait for all uploads to finish
        const results = await Promise.all(uploadPromises);

        // 4. Send response
        return res.json({
            success: true,
            message: "Uploaded successfully",
            data: results
        });

    } catch (error) {
        console.error("Upload Error:", error);
        return res.json({
            success: false,
            message: "Cannot upload files: " + error.message
        });
    }
};