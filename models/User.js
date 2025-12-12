const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    role: { type: String, enum: ['customer','shopkeeper'], required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    phone: { type: String },

    // customer fields
    address: { type: String },
    city: { type: String },

    // shopkeeper fields
    shopName: { type: String },
    shopAddress: { type: String },
    shopCategory: { type: String },
    gstNumber: { type: String },
    shopLogo: { type: String } // path in /public/uploads
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
