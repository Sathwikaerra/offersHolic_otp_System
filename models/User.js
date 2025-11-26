import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, trim: true, lowercase: true },
    profilePic: { type: String },
    mobileNumber: { type: String, trim: true },
    address: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
    name: { first: String, middle: String, last: String },
    profile: {
      profileType: { type: String, enum: ["User", "Admin", "SuperAdmin"], required: true },
    },
    business: {
      active: { type: Boolean, default: false },
      businessProfiles: [{ business: { type: mongoose.Schema.Types.ObjectId, ref: "BusinessProfile" } }],
      offers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Offer" }],
    },
    savedOffers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Offer" }],
    status: { type: String, enum: ["pending", "accepted"], default: "pending" },
    deviceToken: { type: String },

    // ✅ Free Trial
    freeTrial: {
      status: { type: String, enum: ["inactive", "active", "expired"], default: "inactive" },
      startDate: { type: Date },
      expiryDate: { type: Date },
    },

    // ✅ Membership
    membership: {
      status: { type: String, enum: ["inactive", "active", "expired"], default: "inactive" },
      startDate: { type: Date },
      expiryDate: { type: Date },
      planType: { type: String, enum: ["monthly", "quarterly", "yearly", "custom"] },
    },
  }, 
  { timestamps: true }
);

// 🔄 Auto-expire logic
userSchema.methods.checkSubscriptions = function () {
  const now = new Date();

  // Free Trial
  if (this.freeTrial?.status === "active" && this.freeTrial.expiryDate && this.freeTrial.expiryDate < now) {
    this.freeTrial.status = "expired";
  }

  // Membership
  if (this.membership?.status === "active" && this.membership.expiryDate && this.membership.expiryDate < now) {
    this.membership.status = "expired";
  }

  return this;
};

// Run check before saving
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  this.checkSubscriptions();
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
