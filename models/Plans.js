import mongoose from 'mongoose';

const PlanPricingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
    },
    currency: {
        type: String,
        default: 'INR', // Default value for currency
        required: [true, 'Currency is required'],
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
    },
    period: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
        required: [true, 'Interval is required'],
    },
    noOfBusinessProfilesAllowed: {
        type: Number,
        required: [true, 'No of business profiles allowed is required'],
    },
 

});

const PlanPricing = mongoose.model('PlanPricing', PlanPricingSchema);

export default PlanPricing;