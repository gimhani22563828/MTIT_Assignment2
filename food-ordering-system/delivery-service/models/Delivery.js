const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Order' },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    deliveryPersonId: { type: mongoose.Schema.Types.ObjectId, default: null },
    address: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'assigned', 'in-transit', 'delivered', 'cancelled'], 
        default: 'pending' 
    },
    estimatedDeliveryTime: { type: Number, default: 30 }, // minutes
    actualDeliveryTime: { type: Date, default: null },
    deliveryPersonName: { type: String, default: null },
    deliveryPersonPhone: { type: String, default: null },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Delivery', deliverySchema);
