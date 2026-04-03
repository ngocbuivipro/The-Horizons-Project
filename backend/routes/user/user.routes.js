import express from "express";
import { deleteUser, getAllUsers, getUser, updateUser, register, checkOtp, login, logout, googleLogin } from "../../controller/user/user.controller.js";
import { verifyAdmin, verifyToken, verifyUser } from "../../utils/verifyToken.js";
import { registerUserValidate, loginUserValidate } from "../../utils/user.validate.js";
import multer from "multer";
import { cloudinaryUtil } from "../../utils/cloudinary.util.js";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post('/register', upload.single("file"), cloudinaryUtil, registerUserValidate, register)
router.post('/check-otp', checkOtp)
router.post('/login', loginUserValidate, login)
router.post('/google', googleLogin);
router.get("/get-user-verify", verifyToken, getUser)

router.post("/logout", logout);

// check user
router.get("/check/:id", verifyUser, (req, res, next) => {
    res.send("Hello user, you're login and can delete your account")
})

router.get("/admin/:id", verifyAdmin, (req, res, next) => {
    res.send("Hello user, you're login and can delete all accounts")
})


//update - ok
router.put("/:id", updateUser);

//delete
router.delete("/:id", deleteUser);


//get id
router.get("/:id", getUser)

//get all
router.get("/", getAllUsers)


export default router;

