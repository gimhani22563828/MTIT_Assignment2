const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { 
        type: String, 
        enum: ['card', 'cash'],
        required: true 
    },
    // Card details (for credit/debit card)
    cardNumber: { type: String },
    cardHolder: { type: String },
    cardExpiry: { type: String },
    cvv: { type: String },
    
    // UPI details
    upiId: { type: String },
    
    // Net banking
    bankName: { type: String },
    
    // Payment status
    status: { type: String, enum: ['Pending', 'Success', 'Failed'], default: 'Pending' },
    
    // Transaction reference
    transactionId: { type: String, unique: true, sparse: true },
    
    // Error details if payment fails
    errorMessage: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
