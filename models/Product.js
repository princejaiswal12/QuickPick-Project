const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProductSchema = new Schema({
    shop: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // shopkeeper
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    qty: { type: Number, default: 0 },
    image: { type: String }, // path in /public/uploads
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
