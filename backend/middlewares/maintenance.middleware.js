import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../config/env.js";
import SystemSetting from "../models/settings/SystemSetting.js";

// --- CẤU HÌNH CACHE ---
let _cachedConfig = {
    data: null,
    expiry: 0
};
const CACHE_DURATION = 60 * 1000; // Cache trong 60 giây (tùy chỉnh)

// Hàm này để gọi từ bên Controller khi Admin cập nhật settings
// Giúp làm mới cache ngay lập tức thay vì đợi 60s
export const clearMaintenanceCache = () => {
    _cachedConfig = { data: null, expiry: 0 };
};

const checkMaintenance = async (req, res, next) => {
    try {
        if (req.method === 'OPTIONS') return next();

        const whiteList = ['/api/public/status', '/api/admin/login', '/api/auth'];
        if (whiteList.some(path => req.originalUrl.startsWith(path))) {
            return next();
        }

        // --- Logic Check Admin (Giữ nguyên như cũ) ---
        let token;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                // Giả sử logic check Admin của bạn ở đây
                if (decoded.role === 'admin' || decoded.isAdmin) return next();
            } catch (e) { }
        }

        // --- LOGIC CACHE Ở ĐÂY ---
        const now = Date.now();
        let config;

        // 1. Nếu có cache và chưa hết hạn -> Dùng cache
        if (_cachedConfig.data && now < _cachedConfig.expiry) {
            config = _cachedConfig.data;
        } else {
            // 2. Nếu không -> Query DB
            config = await SystemSetting.findOne({ key: 'site_config' });

            // 3. Lưu vào cache
            if (config) {
                _cachedConfig = {
                    data: config,
                    expiry: now + CACHE_DURATION
                };
            }
        }

        if (!config || config.isLive) return next();

        return res.status(503).json({
            success: false,
            code: 'MAINTENANCE_MODE',
            message: config.maintenanceMessage || "The system is under maintenance."
        });

    } catch (error) {
        console.error("Check Maintenance Error:", error);
        next();
    }
};

export default checkMaintenance;
