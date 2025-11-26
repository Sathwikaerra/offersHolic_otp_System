import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'AdCreated',             // Notification for when a user creates an ad
        // 'Transaction',           // Notification for transaction-related events     
        'AdApproved',            // Notification for ad approval
        'AdExpiryReminder',      // Notification for ad expiry reminder
        'FollowedBusinessAd',    // Notification for when a followed business creates an ad
        'ClickMilestone',        // Notification for click milestones on business profiles
        'WelcomeEmail',          // Welcome email notification
        'Clarification'
        // 'PaymentOrderEmail',     // Payment or order related email notification
      ],
    },
    clarificationMessage: {
      type: String,
      requied: () => this.type === 'Clarification',
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
