const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    seller_id: String,
    name: { type: String, required: true },
    price: Number,
    description: String,
    seller_name: String,
    image: String,
    stock: Number,
    buyable: { type: Boolean, default: true },
});

const Product = mongoose.model('Product', productSchema, 'Products');

module.exports = Product;