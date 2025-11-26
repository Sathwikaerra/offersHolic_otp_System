import mongoose from 'mongoose';


const { Schema } = mongoose;

const subscriptionSchema = new Schema({
    // subscriptionTransaction_id: [{
    //     type: Schema.Types.ObjectId,
    //     ref: 'SubscriptionTransaction'
    // }],
    period: {
        type: String,
        required: true
    },
    plan: {
        type: Schema.Types.ObjectId,
        ref: 'PlanPricing',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    razorpay_subscription_id: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
