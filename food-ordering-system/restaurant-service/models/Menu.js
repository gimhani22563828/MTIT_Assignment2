const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String },
    isAvailable: { type: Boolean, default: true },
    ratings: [{
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        score: { type: Number, required: true, min: 1, max: 5 }
    }],
    averageRating: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Menu', menuSchema);
