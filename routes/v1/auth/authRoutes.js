import express from "express";
import { adminLogin,sendOtp,verifyOtp,updateFullName ,verifyotp, sendOtpforRegistration, register, UserEmailLogin, UserMobileLogin } from "../../../controllers/auth/authController.js";


const router = express.Router();


router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.put("/update-fullname", updateFullName);


//admin routes
router.post("/admin-login", adminLogin);

//user routes
// -------------------login routes-------------------
router.post("/user-email-login", UserEmailLogin);
router.post("/user-mobile-login", UserMobileLogin);
router.post("/verify-otp", verifyotp);

// -------------------register routes-------------------
router.post("/send-register-otp", sendOtpforRegistration);
router.post("/register", register);







export default router;

