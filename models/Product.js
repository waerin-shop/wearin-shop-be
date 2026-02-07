const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    seller_id: String,
    name: { type: String, required: true },
    price: Number,
    description: String,
    seller_name: String,
    image: String,
    stock: Number,
    buyable: { type: Boolean, default: true },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductType' },
    material_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
});

const Product = mongoose.model('Product', productSchema, 'Products');

module.exports = Product;