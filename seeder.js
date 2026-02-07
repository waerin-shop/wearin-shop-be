const Product = require('./models/Product');
const Cart = require('./models/Cart');
const User = require('./models/User');
const Category = require('./models/Category');
const ProductType = require('./models/ProductType');
const Material = require('./models/Material');
const Order = require('./models/Order');

const seedData = async () => {
    try {
        // --- 1. BERSIHKAN DATABASE ---
        console.log("🧹 Membersihkan database...");
        await Product.deleteMany({});
        await Cart.deleteMany({});
        await Category.deleteMany({});
        await ProductType.deleteMany({});
        await Material.deleteMany({});
        await Order.deleteMany({});

        // --- 2. SEED MASTER DATA ---
        console.log("🌱 Seeding Master Data...");

        const catWanita = await Category.create({ name: 'Pakaian Wanita' });
        const catElektronik = await Category.create({ name: 'Elektronik' });

        const typeTankTop = await ProductType.create({ name: 'Tank Top' });
        const typeAksesoris = await ProductType.create({ name: 'Aksesoris Komputer' });

        const matKatun = await Material.create({ name: 'Katun' });
        const matPlastik = await Material.create({ name: 'Plastik ABS' });

        // --- 3. SEED PRODUK (Pindahkan ke Atas) ---
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

        // --- 4. CARI USER & BUAT ORDER/CART ---
        console.log("👤 Mencari user 'raka'...");
        const user = await User.findOne({ username: 'raka' });

        if (user) {
            // --- 5. BUAT ORDER
            console.log("📦 Membuat Dummy Order...");
            const orderData = new Order({
                user_id: user._id,
                items: [
                    {
                        product_id: createdProducts[0]._id,
                        name: "Tank Top Basic",
                        price: 129990,
                        quantity: 1,
                        image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=500&q=60"
                    }
                ],
                shipping_address: {
                    name: "Raka",
                    phone: "+62 873-0986-5721",
                    full_address: "Jl. Mentari No. 7a, Mekarsari..."
                },
                payment_method: "Debit/Credit Card",
                summary: {
                    subtotal: 162500,
                    shipping_cost: 20000,
                    service_fee: 1000,
                    discount: 52510,
                    grand_total: 130990
                }
            });

            await orderData.save();
            console.log("✅ Data Dummy Order berhasil dibuat!");

            // --- 6. BUAT KERANJANG ---
            console.log("🛒 Membuat Dummy Keranjang...");
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

        } else {
            console.log("⚠️ User 'raka' tidak ditemukan. Order & Cart dilewati.");
        }

    } catch (error) {
        console.error("❌ Gagal seeding data:", error.message);
    }
};

module.exports = seedData;