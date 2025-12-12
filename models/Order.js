const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderItemSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    qty: Number,
    price: Number
}, { _id: false });

const OrderSchema = new Schema({
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    shop: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    total: Number,
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'shipped', 'delivered'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
