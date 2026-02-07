const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const seedData = require('./seeder');
const Product = require('./models/Product');
const User = require('./models/User');
const Cart = require('./models/Cart');
const Category = require('./models/Category');
const ProductType = require('./models/ProductType');
const Material = require('./models/Material');

const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000; // Menggunakan env PORT jika ada (untuk production)

// --- KONFIGURASI CORS ---
const allowedOrigins = [
   "http://localhost:3000",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'CORS Policy: Access denied.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.options(/(.*)/, cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- KONFIGURASI CLOUDINARY ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'toko-online-uploads',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});

const upload = multer({ storage: storage });

mongoose.connect(process.env.MONGO_ATLAS_URI)
    .then(async () => {
        console.log("✅ MongoDB Connected (Persistent Mode)");
        await seedData();
    })
    .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    });


app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User berhasil dibuat' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'User tidak ditemukan' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Password salah' });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, username: user.username });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET Public
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find()
            .populate('category_id')
            .populate('type_id')
            .populate('material_id');
        res.json(products);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/products/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ message: 'Format ID Produk tidak valid' });
    }
    try {
        const product = await Product.findById(req.params.id)
            .populate('category_id')
            .populate('type_id')
            .populate('material_id');

        if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
        res.json(product);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/products', auth, upload.single('image'), async (req, res) => {
    const imageFilename = req.file ? req.file.filename : ''; 
    
    const { category_id, type_id, material_id } = req.body;

    const product = new Product({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        image: imageFilename,
        seller_id: req.body.seller_id || "01",
        seller_name: req.body.seller_name || "Admin",
        stock: req.body.stock || 0,
        buyable: req.body.buyable === 'true' || req.body.buyable === true,
        category_id: category_id || null,
        type_id: type_id || null,
        material_id: material_id || null
    });

    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/products/:id', auth, upload.single('image'), async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ message: 'Format ID Produk tidak valid' });
    }

    try {
        let updateData = {
            ...req.body,
            buyable: req.body.buyable === 'true' || req.body.buyable === true
        };

        if (req.file) {
            updateData.image = req.file.filename;
        }

        if (req.body.category_id) updateData.category_id = req.body.category_id;
        if (req.body.type_id) updateData.type_id = req.body.type_id;
        if (req.body.material_id) updateData.material_id = req.body.material_id;

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true }
        ).populate('category_id type_id material_id');

        if (!updatedProduct) return res.status(404).json({ message: 'Produk tidak ditemukan' });
        res.json(updatedProduct);

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/products/:id', auth, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ message: 'Format ID Produk tidak valid' });
    }

    try {
        const result = await Product.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ message: 'Produk tidak ditemukan' });
        res.json({ message: 'Produk berhasil dihapus' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get keranjang belanja
// GET CART
app.get('/api/cart', auth, async (req, res) => {
    try {
        const cartItems = await Cart.find({ user_id: req.user.id })
            .populate('product_id'); 

        const formattedCart = cartItems.map(item => {
            if (!item.product_id) return null; 
            return {
                _id: item._id, 
                product_id: item.product_id._id, 
                quantity: item.quantity,
                selected: item.selected,
                productInfo: {
                    name: item.product_id.name,
                    price: item.product_id.price,
                    image: item.product_id.image,
                    stock: item.product_id.stock
                }
            };
        }).filter(item => item !== null); 

        res.json(formattedCart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Tambah Keranjang Belanja
app.post('/api/cart', auth, async (req, res) => {
    const { product_id, quantity } = req.body; 

    if (!mongoose.Types.ObjectId.isValid(product_id)) {
        return res.status(400).json({ message: 'Format ID Produk tidak valid' });
    }

    try {
        const product = await Product.findById(product_id);
        if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });

        let cartItem = await Cart.findOne({ user_id: req.user.id, product_id });

        if (cartItem) {
            const newQuantity = cartItem.quantity + quantity;
            if (newQuantity > product.stock) {
                return res.status(400).json({ message: `Stok tidak cukup. Sisa stok: ${product.stock}` });
            }
            cartItem.quantity = newQuantity;
            await cartItem.save();
        } else {
            if (quantity > product.stock) {
                return res.status(400).json({ message: `Stok tidak cukup. Sisa stok: ${product.stock}` });
            }
            cartItem = new Cart({
                user_id: req.user.id,
                product_id, 
                quantity,
                selected: true
            });
            await cartItem.save();
        }

        res.json({ message: 'Produk berhasil masuk keranjang', cartItem });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Ubah Keranjang Belanja
app.put('/api/cart/:id', auth, async (req, res) => {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ message: 'Format ID Keranjang tidak valid' });
    }

    const { quantity, selected } = req.body;

    try {
        const cartItem = await Cart.findOne({ _id: req.params.id, user_id: req.user.id });
        if (!cartItem) return res.status(404).json({ message: 'Item keranjang tidak ditemukan' });

        if (quantity !== undefined) {
            // Ambil data produk asli pakai findById
            const product = await Product.findById(cartItem.product_id);
            
            if (product && quantity > product.stock) {
                return res.status(400).json({ message: `Maksimal pembelian adalah ${product.stock} item` });
            }
            cartItem.quantity = quantity;
        }

        if (selected !== undefined) {
            cartItem.selected = selected;
        }

        await cartItem.save();
        res.json(cartItem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Hapus Keranjang Belanja
app.delete('/api/cart/:id', auth, async (req, res) => {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ message: 'Format ID Keranjang tidak valid' });
    }
    
    try {
        const result = await Cart.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
        if (!result) return res.status(404).json({ message: 'Item tidak ditemukan' });
        res.json({ message: 'Item dihapus dari keranjang' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// MASTER
app.get('/api/master/categories', async (req, res) => {
    const data = await Category.find(); res.json(data);
});
app.get('/api/master/types', async (req, res) => {
    const data = await ProductType.find(); res.json(data);
});
app.get('/api/master/materials', async (req, res) => {
    const data = await Material.find(); res.json(data);
});

app.get('/', (req, res) => {
    res.send('Server Toko Online (Non-Serverless)!');
});

app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});