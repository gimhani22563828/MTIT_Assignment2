const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    cuisineType: { type: String },
    image: { type: String },
    location: {
        lat: { type: Number },
        lng: { type: Number }
    },
    ratings: [{
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        score: { type: Number, required: true, min: 1, max: 5 }
    }],
    averageRating: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
