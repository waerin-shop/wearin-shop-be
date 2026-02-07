const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    label: { type: String, default: 'Rumah' }, // Contoh: "Rumah", "Kantor", "Kost"
    name: { type: String, required: true },    // Nama Penerima (Bisa beda dgn nama akun)
    phone: { type: String, required: true },   // No HP Penerima
    full_address: { type: String, required: true }, // Alamat Lengkap
    is_primary: { type: Boolean, default: false } // Penanda Alamat Utama
}, { timestamps: true });

const Address = mongoose.model('Address', addressSchema, 'Addresses');
module.exports = Address;