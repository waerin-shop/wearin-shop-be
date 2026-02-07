const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    product_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product',
        required: true 
    },
    quantity: { type: Number, default: 1, min: 1 },
    selected: { type: Boolean, default: true }
});
const Cart = mongoose.model('Cart', cartSchema, 'Carts');

module.exports = Cart;