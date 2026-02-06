const Product = require('./models/Product');

const seedData = async () => {
    try {
        const count = await Product.countDocuments();

        if (count === 0) {
            console.log("🌱 Collection kosong. Memulai seeding data...");

            const dummyData = [
                {
                    id: "p-001",
                    name: "Laptop Gaming Local",
                    price: 15000000,
                    description: "Laptop performa tinggi dengan kualitas terbaik.",
                    seller_id: "99",
                    seller_name: "Toko Lokal",
                    image: "1768017607871-mahavir-shah-gtZxq2Rpa_Y-unsplash.jpg",
                    stock: 10,
                    buyable: true,
                },
                {
                    id: "p-002",
                    name: "Mouse Wireless",
                    price: 250000,
                    description: "Mouse wireless ergonomis untuk produktivitas.",
                    seller_id: "99",
                    seller_name: "Toko Lokal",
                    image: "1768017557020-andrey-matveev-7eZeXqKAywU-unsplash.jpg",
                    stock: 102,
                    buyable: true,
                },
                {
                    id: "p-003",
                    name: "Keyboard Mechanical",
                    price: 850000,
                    description: "Keyboard mechanical RGB dengan switch blue.",
                    seller_id: "99",
                    seller_name: "Toko Lokal",
                    image: "1768017521598-bady-abbas-jOmBUCtflWA-unsplash (1).jpg",
                    stock: 32,
                    buyable: true,
                }
            ];

            await Product.insertMany(dummyData);
            console.log("[SUCCESS] 3 Data dummy berhasil ditambahkan!");
        } else {
            console.log(`[INFO] Data sudah ada (${count} produk). Skip seeding.`);
        }
    } catch (error) {
        console.error("[ERROR] Gagal seeding data:", error.message);
    }
};

module.exports = seedData;