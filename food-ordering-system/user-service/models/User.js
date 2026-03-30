const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Roles: user (customer), admin, deliveryPerson
    role: { type: String, enum: ['user', 'admin', 'deliveryPerson'], default: 'user' },
    // For delivery persons
    phone: { type: String, default: null },
    isAvailable: { type: Boolean, default: true }, // Delivery person availability
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
