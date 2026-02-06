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
    .then(() => {
        console.log("✅ MongoDB Connected (Persistent Mode)");
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
        const products = await Product.find();
        res.json(products);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ id: req.params.id });
        if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
        res.json(product);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/products', auth, upload.single('image'), async (req, res) => {
    const newId = req.body.id || uuidv4();
    const imageFilename = req.file ? req.file.filename : ''; 

    const product = new Product({
        id: newId,
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        image: imageFilename,
        seller_id: req.body.seller_id || "01",
        seller_name: req.body.seller_name || "Admin",
        stock: req.body.stock || 0,
        buyable: req.body.buyable === 'true' || req.body.buyable === true,
    });

    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/products/:id', auth, upload.single('image'), async (req, res) => {
    try {
        let updateData = {
            ...req.body,
            buyable: req.body.buyable === 'true' || req.body.buyable === true
        };

        if (req.file) {
            updateData.image = req.file.filename;
        }

        const updatedProduct = await Product.findOneAndUpdate(
            { id: req.params.id }, 
            updateData, 
            { new: true }
        );

        if (!updatedProduct) return res.status(404).json({ message: 'Produk tidak ditemukan' });
        res.json(updatedProduct);

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/products/:id', auth, async (req, res) => {
    try {
        const result = await Product.findOneAndDelete({ id: req.params.id });
        if (!result) return res.status(404).json({ message: 'Produk tidak ditemukan' });
        res.json({ message: 'Produk berhasil dihapus' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/', (req, res) => {
    res.send('Server Toko Online (Non-Serverless)!');
});

app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});