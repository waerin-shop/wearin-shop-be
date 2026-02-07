const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    items: [{
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        quantity: Number,
        image: String
    }],

    shipping_address: {
        name: { type: String, required: true }, // ex: Hanifa
        phone: { type: String, required: true }, // ex: +62 873...
        full_address: { type: String, required: true } // ex: Jl. Mentari No. 7a...
    },

    shipping_method: { type: String, default: 'Reguler' },
    payment_method: { type: String, required: true }, // ex: 'Debit/Credit Card', 'E-Wallet'
    
    // STATUS PESANAN
    payment_status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    order_status: { type: String, enum: ['processing', 'shipped', 'delivered', 'cancelled'], default: 'processing' },

    summary: {
        subtotal: Number,       
        shipping_cost: Number,  
        service_fee: Number,    
        discount: Number,       
        grand_total: Number
    },

    created_at: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema, 'Orders');
module.exports = Order;