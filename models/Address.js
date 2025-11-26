import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    addressName: {
        type: String,
    },
    addressType: {
        type: String,
    },
    addressLine1: {
        type: String,
    },
    addressLine2: {
        type: String,
    },
    landmark: {
        type: String,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    country: {
        type: String,
    },
    pincode: {
        type: String,
    },
    coordinates: {
        type: {
            type: String,
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            default: [0, 0],
        },
    },
});

addressSchema.index({ coordinates: '2dsphere' }); // Index for geospatial queries

const Address = mongoose.model('Address', addressSchema);

export default Address;
