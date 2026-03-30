const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    restaurantId: { type: String, required: true },
    items: [{
        menuId: String,
        name: String,
        price: Number,
        quantity: Number
    }],
    totalAmount: { type: Number, required: true },
    location: { type: String, required: true },
    // Order status: pending → preparing → ready → picked → delivering → delivered (or cancelled)
    orderStatus: { 
        type: String, 
        enum: ['pending', 'preparing', 'ready', 'picked', 'delivering', 'delivered', 'cancelled'], 
        default: 'pending' 
    },
    // Delivery person assignment
    deliveryPersonId: { type: mongoose.Schema.Types.ObjectId, default: null },
    deliveryPersonName: { type: String, default: null },
    deliveryPersonPhone: { type: String, default: null },
    // Delivery tracking
    deliveryAddress: { type: String, default: null },
    estimatedDeliveryTime: { type: Number, default: 30 }, // minutes
    actualDeliveryTime: { type: Date, default: null },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
