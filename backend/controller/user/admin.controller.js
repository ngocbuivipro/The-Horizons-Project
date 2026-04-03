import {sendAdminToken} from "../../helpers/JsonToken.js"
import Admin from "../../models/user/Admin.js"
import bcrypt from "bcryptjs";
import SystemSetting from "../../models/settings/SystemSetting.js";
import SmtpConfig from "../../models/settings/SmtpConfig.js";
import {encrypt} from "../../utils/crypto.js";
import Coupon from "../../models/settings/Coupon.js";

// SEED ADMIN
export const seedAdmin = async () => {
    try {
        const email = "tamnguyenthanh107@gmail.com"
        const password = "traitimtrongvang107@"
        const username = "tam107";

        const existingAdmin = await Admin.findOne({email: email})

        if (existingAdmin) {
            return;
        }

        const newAdmin = new Admin({
            email: email,
            password: password,
            username: username
        })

        await newAdmin.save() // Model will hash automatically at save time
        console.log("Admin seeded successfully")

    } catch (error) {
        console.log("Error in creating Admin", error)
    }
}


// CREATE ADMIN
export const createAdmin = async (req, res) => {
    try {
        const {username, email, password, phoneNumber} = req.body;

        // Check duplicate email
        const existing = await Admin.findOne({email});
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        // --- FIX: Remove manual hashing here ---
        // Create Admin
        const admin = new Admin({
            username,
            email,
            password: password, // Pass raw password
            phoneNumber,
        });

        await admin.save(); // Model will hash automatically

        return res.status(201).json({
            success: true,
            message: "Admin created successfully",
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                phoneNumber: admin.phoneNumber,
            },
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


// LOGIN ADMIN
export const loginAdmin = async (req, res) => {
    try {
        let {email, password} = req.body;

        // Check Admin exists
        const admin = await Admin.findOne({email});
        const response = {
            username: admin.username,
            email: admin.email,
        }


        if (!admin) {
            return res.status(400).json({
                success: false,
                message: "Admin not found",
            });
        }

        // --- FIX: Compare logic ---
        // Trim input password to avoid trailing spaces
        const isMatch = await bcrypt.compare(password.trim(), admin.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Password is not correct",
            });
        }

        return sendAdminToken(admin, 200, res);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

export const logoutAdmin = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to logout",
        });
    }
};

export const getAdmin = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: req.admin,
        });
    } catch (error) {
        return res.json({
            success: false,
            message: "Error in BE get Admin"
        })
    }
}

export const getAllAdmin = async (req, res) => {
    try {
        const admins = await Admin.find({_id: {$ne: req.admin._id}})
        res.status(200).json({
            success: true,
            data: admins,
        });
    } catch (error) {
        return res.json({
            success: false,
            message: "Error in BE get all Admin"
        })
    }
}

export const deleteAdmin = async (req, res) => {
    try {
        const {id} = req.params
        await Admin.findByIdAndDelete(id)
        res.status(200).json({
            success: true,
            message: "Admin deleted successfully",
        });
    } catch (error) {
        return res.json({
            success: false,
            message: "Error in BE delete Admin"
        })
    }
}

export const updateAdmin = async (req, res) => {
    try {
        const {id} = req.params
        const {username, email, phoneNumber} = req.body
        const admin = await Admin.findByIdAndUpdate(id, {
            username,
            email,
            phoneNumber
        }, {new: true})
        res.status(200).json({
            success: true,
            message: "Admin updated successfully",
            data: admin
        });
    } catch (error) {
        return res.json({
            success: false,
            message: "Error in BE update Admin"
        })
    }
}

// --- MAINTENANCE SECTION ---
export const toggleMaintenance = async (req, res) => {
    try {
        const {isLive, message} = req.body;
        let config = await SystemSetting.findOne({key: 'site_config'});

        if (!config) {
            config = new SystemSetting({key: 'site_config'});
        }

        config.isLive = isLive;
        if (message) config.maintenanceMessage = message;

        await config.save();
        res.json({success: true, isLive: config.isLive, message: config.maintenanceMessage});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

export const updateProcessingFee = async (req, res, next) => {
    try {
        const {creditCardFeePercent, enableCreditCardFee} = req.body;

        if (creditCardFeePercent < 0 || creditCardFeePercent > 100) {
            return res.status(400).json({
                success: false,
                message: "Fee percentage must be between 0 and 100."
            });
        }

        const updatedConfig = await SystemSetting.findOneAndUpdate(
            {key: 'site_config'},
            {
                $set: {
                    "payment.creditCardFeePercent": Number(creditCardFeePercent) || 0,
                    "payment.enableCreditCardFee": enableCreditCardFee ?? true
                }
            },
            {new: true, upsert: true, setDefaultsOnInsert: true}
        );

        res.status(200).json({
            success: true,
            message: "Processing fee updated successfully",
            data: updatedConfig
        });

    } catch (error) {
        next(error);
    }
};


export const getSystemStatus = async (req, res, next) => {
    try {
        const config = await SystemSetting.findOne({key: 'site_config'});

        const defaultResponse = {
            success: true,
            isLive: true,
            message: "",
            modules: {
                bus: true,
                hotel: true,
                tour: true,
                about: true
            },
            credit: true,
            transfer: true
        };

        if (!config) {
            return res.status(200).json(defaultResponse);
        }

        res.status(200).json({
            success: true,
            isLive: config.isLive ?? defaultResponse.isLive,
            message: config.maintenanceMessage || "System is under maintenance.",
            modules: config.modules || defaultResponse.modules,

            credit: config.credit ?? defaultResponse.credit,
            transfer: config.transfer ?? defaultResponse.transfer,

            payment: config.payment
        });

    } catch (error) {
        next(error);
    }
};
export const updateSystemSettings = async (req, res, next) => {
    try {
        const {isLive, message, modules} = req.body;

        const updatedConfig = await SystemSetting.findOneAndUpdate(
            {key: 'site_config'},
            {
                $set: {
                    isLive: isLive,
                    maintenanceMessage: message,
                    modules: modules
                }
            },
            {new: true, upsert: true, setDefaultsOnInsert: true}
        );

        res.status(200).json({
            success: true,
            message: "System settings updated successfully",
            data: updatedConfig
        });

    } catch (error) {
        next(error);
    }
};

export const getSmtpConfig = async (req, res) => {
    try {
        const config = await SmtpConfig.findOne();
        if (!config) {
            return res.json({success: true, data: null});
        }

        const displayData = config.toObject();
        displayData.password = "";

        res.status(200).json({
            success: true,
            data: displayData
        });
    } catch (err) {
        res.status(500).json({success: false, message: err.message});
    }
};

// SAVE/UPDATE SMTP Config
export const saveSmtpConfig = async (req, res) => {
    try {
        const {host, port, username, password, email, fromName, secure} = req.body;

        let config = await SmtpConfig.findOne();
        if (!config) {
            config = new SmtpConfig();
        }

        config.host = host;
        config.port = port;
        config.username = username;
        config.email = email;
        config.fromName = fromName;

        if (typeof secure !== 'undefined') {
            config.secure = secure;
        } else {
            config.secure = port == 465;
        }

        if (password && password.trim() !== "") {
            config.password = encrypt(password);
        }

        await config.save();

        res.status(200).json({
            success: true,
            message: 'SMTP configuration saved successfully!'
        });
    } catch (err) {
        res.status(500).json({success: false, message: err.message});
    }
};

// --- CREATE COUPON ---
export const createCoupon = async (req, res) => {
    try {
        const {
            code,
            matchType,
            discountType,
            discountValue,
            minOrderValue,
            maxDiscountAmount,
            startDate,
            endDate,
            usageLimit,
            description
        } = req.body;

        if (!code || !discountValue) {
            return res.status(400).json({
                success: false,
                message: "Coupon code and discount value are required."
            });
        }

        const upperCode = code.toUpperCase().trim();
        const existingCoupon = await Coupon.findOne({code: upperCode});
        if (existingCoupon) {
            return res.status(400).json({
                success: false,
                message: `Coupon '${upperCode}' already exists.`
            });
        }

        const newCoupon = new Coupon({
            code: upperCode,
            matchType: matchType || "EXACT",
            discountType,
            discountValue,
            minOrderValue: minOrderValue || 0,
            maxDiscountAmount,
            startDate,
            endDate,
            usageLimit: usageLimit || 0,
            description,
            isActive: true
        });

        await newCoupon.save();

        return res.status(201).json({
            success: true,
            message: "Coupon created successfully",
            data: newCoupon
        });

    } catch (error) {
        console.error("Create Coupon Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while creating coupon",
            error: error.message
        });
    }
};

// --- GET ALL COUPONS (Admin view) ---
export const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({createdAt: -1});

        return res.status(200).json({
            success: true,
            count: coupons.length,
            data: coupons
        });
    } catch (error) {
        console.error("Get All Coupons Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching coupons list"
        });
    }
};

// --- GET SINGLE COUPON ---
export const getCouponById = async (req, res) => {
    try {
        const {id} = req.params;
        const coupon = await Coupon.findById(id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: coupon
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while fetching coupon details"
        });
    }
};

// --- UPDATE COUPON ---
export const updateCoupon = async (req, res) => {
    try {
        const {id} = req.params;

        if (req.body.code) {
            req.body.code = req.body.code.toUpperCase().trim();
            const duplicate = await Coupon.findOne({
                code: req.body.code,
                _id: {$ne: id}
            });
            if (duplicate) {
                return res.status(400).json({
                    success: false,
                    message: `Coupon code '${req.body.code}' is already used by another coupon.`
                });
            }
        }

        const updatedCoupon = await Coupon.findByIdAndUpdate(
            id,
            {$set: req.body},
            {new: true, runValidators: true}
        );

        if (!updatedCoupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found to update"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Coupon updated successfully",
            data: updatedCoupon
        });

    } catch (error) {
        console.error("Update Coupon Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while updating coupon"
        });
    }
};

// --- DELETE COUPON ---
export const deleteCoupon = async (req, res) => {
    try {
        const {id} = req.params;
        const deletedCoupon = await Coupon.findByIdAndDelete(id);

        if (!deletedCoupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found to delete"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Coupon deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while deleting coupon"
        });
    }
};

// --- QUICK TOGGLE STATUS (Active/Inactive) ---
export const toggleCouponStatus = async (req, res) => {
    try {
        const {id} = req.params;
        const coupon = await Coupon.findById(id);

        if (!coupon) return res.status(404).json({success: false, message: "Not found"});

        coupon.isActive = !coupon.isActive;
        await coupon.save();

        return res.status(200).json({
            success: true,
            message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'}`,
            data: coupon
        });
    } catch (error) {
        return res.status(500).json({success: false, message: "Server error"});
    }
};

export const togglePaymentOptionsStatus = async (req, res) => {
    try {
        const {credit, transfer} = req.body;

        if (typeof credit === 'undefined' || typeof transfer === 'undefined') {
            throw new Error("Invalid credit or transfer status provided.");
        }

        const updatedConfig = await SystemSetting.findOneAndUpdate(
            {key: 'site_config'},
            {
                $set: {credit: credit, transfer: transfer}
            },
            {new: true, upsert: true, setDefaultsOnInsert: true}
        );

        return res.status(200).json({
            success: true,
            data: {
                credit: updatedConfig.credit,
                transfer: updatedConfig.transfer
            }
        });
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({success: false, message: error.message || "Server error"});
    }
};

export const updateModules = async (req, res, next) => {
    try {
        const {modules} = req.body;

        if (!modules) {
            return res.status(400).json({success: false, message: "Modules data is required"});
        }

        const updatedConfig = await SystemSetting.findOneAndUpdate(
            {key: 'site_config'},
            {
                $set: {modules: modules}
            },
            {new: true, upsert: true, setDefaultsOnInsert: true}
        );

        res.status(200).json({
            success: true,
            message: "Module visibility updated successfully",
            data: updatedConfig.modules
        });

    } catch (error) {
        res.status(500).json({message: "update modules failed"});
    }
};
