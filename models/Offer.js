import mongoose from 'mongoose';

// Schema for status history
const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        'pending review',
        'approved',
        'active',
        'inactive',
        'clarification submitted',
        'rejected',
        'clarification required',
        'expired',
      ],
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    clarificationMessageHistory: String,
  },
  { _id: false }
);

// Schema for clicks
const clickSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    count: {
      type: Number,
      default: 1,
      required: true,
    },
  },
  { _id: false }
);

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: value => value.length >= 2,
        message: 'Offer name is required',
      },
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    businessProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusinessProfile',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    offerType: {
      type: String,
      enum: ['discount', 'buy-one-get-one', 'free-shipping', 'other'],
    },
    offerValue: String,
    active: {
      type: Boolean,
      default: true,
    },
    offerExpiryDate: {
      type: Date,
      required: true,
    },
    offerUsageLimit: String,
    offerDetails: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'pending review',
        'clarification required',
        'clarification submitted',
        'approved',
        'active',
        'inactive',
        'rejected',
        'expired',
      ],
      default: 'pending review',
    },
    // clarificationMessage: {
    //   type: String,
    //   required() {
    //     return this.status === 'clarification required';
    //   },
    // },
    // clarificationAnswer: {
    //   type: String,
    //   required() {
    //     return this.status === 'clarification submitted';
    //   },
    // },
    viewedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    clicks: [clickSchema],
    views: {
      type: Number,
      default: 0,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [{ status: 'pending review' }],
    },
    featuredImage: String,
    offerReel: String,
    videos: [
      {
        videoUrl: {
          type: String,
          // required: true,
        },
      },
    ],
    gallery: [
      {
        imageUrl: {
          type: String,
          // required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

/* ✅ Auto push status changes */
offerSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status });
  }
  next();
});

/* ✅ Add clarification message history */
offerSchema.pre('save', function (next) {
  if (this.status === 'clarification required') {
    this.statusHistory.push({
      status: this.status,
      clarificationMessageHistory: this.clarificationMessage,
    });
  }
  next();
});

/* ✅ Automatically mark as expired on save */
offerSchema.pre('save', function (next) {
  const now = new Date();
  if (this.offerExpiryDate && this.offerExpiryDate <= now) {
    this.active = false;
    this.status = 'expired';
  }
  next();
});

/* ✅ Custom method to check and update expiry dynamically */
offerSchema.methods.checkExpiry = function () {
  const now = new Date();
  if (this.active && this.offerExpiryDate && this.offerExpiryDate <= now) {
    this.active = false;
    this.status = 'expired';
    this.statusHistory.push({ status: 'expired', changedAt: now });
  }
  return this;
};

const Offer = mongoose.model('Offer', offerSchema);
export default Offer;
