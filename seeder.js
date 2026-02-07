const Product = require('./models/Product');
const Cart = require('./models/Cart');
const User = require('./models/User');
const Category = require('./models/Category');
const ProductType = require('./models/ProductType');
const Material = require('./models/Material');

const seedData = async () => {
    try {
        console.log("🧹 Membersihkan database...");
        await Product.deleteMany({});
        await Cart.deleteMany({});
        await Category.deleteMany({});
        await ProductType.deleteMany({});
        await Material.deleteMany({});

        console.log("🌱 Seeding Master Data...");

        // Buat Kategori
        const catWanita = await Category.create({ name: 'Pakaian Wanita' });
        const catElektronik = await Category.create({ name: 'Elektronik' });

        // Buat Tipe
        const typeTankTop = await ProductType.create({ name: 'Tank Top' });
        const typeAksesoris = await ProductType.create({ name: 'Aksesoris Komputer' });

        // Buat Bahan
        const matKatun = await Material.create({ name: 'Katun' });
        const matPlastik = await Material.create({ name: 'Plastik ABS' });

        console.log("🌱 Seeding Produk...");
        
        const createdProducts = await Product.insertMany([
            {
                name: "Tank Top Basic",
                price: 129990,
                description: "Tank top nyaman dipakai sehari-hari.",
                seller_id: "99",
                seller_name: "Official Store",
                image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=500&q=60",
                stock: 50,
                buyable: true,
                category_id: catWanita._id,
                type_id: typeTankTop._id,
                material_id: matKatun._id
            },
            {
                name: "Mouse Wireless",
                price: 250000,
                description: "Mouse wireless ergonomis.",
                seller_id: "99",
                seller_name: "Toko Lokal",
                image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=500&q=60",
                stock: 102,
                buyable: true,
                category_id: catElektronik._id,
                type_id: typeAksesoris._id,
                material_id: matPlastik._id
            }
        ]);
        
        console.log(`✅ ${createdProducts.length} Produk berhasil ditambahkan!`);

        console.log("🛒 Seeding Keranjang User 'raka'...");
        const user = await User.findOne({ username: 'raka' });

        if (user) {
            const cartData = [
                {
                    user_id: user._id,
                    product_id: createdProducts[0]._id,
                    quantity: 1,
                    selected: true
                }
            ];
            await Cart.insertMany(cartData);
            console.log("✅ Keranjang berhasil dibuat!");
        }

    } catch (error) {
        console.error("❌ Gagal seeding data:", error.message);
    }
};

module.exports = seedData;