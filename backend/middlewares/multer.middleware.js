import multer from "multer";
import path from "path";

// Configure where to temporarily store files
const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    },
});

// Create the Multer instance
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

export default upload;
