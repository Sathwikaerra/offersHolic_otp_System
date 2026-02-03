import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: String,
  mobileNumber: String,
  otp: String,
  expiresAt: Date,
});

export default mongoose.model("Otp", otpSchema);
