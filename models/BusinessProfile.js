import mongoose from "mongoose";

const businessProfileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    GSTIN: {
      type: String,
      trim: true,

    },
    ProfileImage:{
       type: String,
      trim: true,

    },
     status: {
    type: String,
    enum: ["pending", "active", "rejected"], // ✅ Allowed values
    default: "pending" // ✅ Default status
  },

    User: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    offers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
    }],
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
    },
    logo: {
      type: String
    },
    businessPictureGallery: [

      {
        imageUrl: {
          type: String,
          required: true,
        },
      }
    ],
    website: {
      type: String,
      trim: true,
    },
    followers: {
      count: {
        type: Number,
        default: 0,
      },
      followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    socialMedia: {
      facebook: {
        type: String,
        trim: true,
      },
      twitter: {
        type: String,
        trim: true,
      },
      linkedin: {
        type: String,
        trim: true,
      },
      instagram: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const BusinessProfile = mongoose.model("BusinessProfile", businessProfileSchema);

export default BusinessProfile;
