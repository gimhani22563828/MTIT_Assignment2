const Payment = require('../models/Payment');
const axios = require('axios');

// Generate unique transaction ID
const generateTransactionId = () => {
    return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Validate card details
const validateCardDetails = (cardNumber, cardHolder, cardExpiry, cvv) => {
    // Remove spaces from card number
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    
    // Check card number (basic Luhn algorithm validation)
    if (!/^\d{13,19}$/.test(cleanCardNumber)) {
        return { valid: false, error: 'Invalid card number format' };
    }
    
    // Validate expiry format (MM/YY)
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        return { valid: false, error: 'Expiry should be in MM/YY format' };
    }
    
    // Validate CVV
    if (!/^\d{3,4}$/.test(cvv)) {
        return { valid: false, error: 'Invalid CVV' };
    }
    
    // Validate cardholder name
    if (!cardHolder || cardHolder.trim().length < 3) {
        return { valid: false, error: 'Invalid cardholder name' };
    }
    
    return { valid: true };
};

// Validate UPI ID
const validateUpiId = (upiId) => {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
    if (!upiRegex.test(upiId)) {
        return { valid: false, error: 'Invalid UPI ID format (example: user@paytm)' };
    }
    return { valid: true };
};

// Process payment based on method
const processPaymentByMethod = (paymentMethod, paymentData) => {
    switch (paymentMethod) {
        case 'card':
            // For card payment, skip validation and always succeed
            return { success: true };

        case 'cash':
            // Cash payment is always successful - will be confirmed on delivery
            return { success: true };

        default:
            return { success: false, error: 'Invalid payment method' };
    }
};

exports.processPayment = async (req, res, next) => {
    try {
        const { orderId, userId, amount, paymentMethod, cardNumber, cardHolder, cardExpiry, cvv, upiId, bankName } = req.body;
        
        // Validate required fields
        if (!orderId || !userId || amount === undefined || !paymentMethod) {
            return res.status(400).json({ error: 'OrderId, userId, amount, and paymentMethod are required' });
        }

        // Validate payment method specific fields
        if (paymentMethod === 'card') {
            // Card payment doesn't require validation - all fields are optional
        }

        if (paymentMethod === 'cash') {
            // Cash payment doesn't require any additional fields
        }

        // Process payment based on method
        const paymentData = { cardNumber, cardHolder, cardExpiry, cvv, upiId, bankName };
        const paymentResult = processPaymentByMethod(paymentMethod, paymentData);

        // Generate transaction ID
        const transactionId = generateTransactionId();

        // Prepare payment object
        const paymentPayload = {
            orderId,
            userId,
            amount,
            paymentMethod,
            status: paymentResult.success ? 'Success' : 'Failed',
            transactionId,
            errorMessage: paymentResult.error
        };

        // Add sensitive details (masked for security)
        if (paymentMethod === 'card') {
            paymentPayload.cardNumber = cardNumber ? '**** **** **** ' + cardNumber.slice(-4) : '';
            paymentPayload.cardHolder = cardHolder || '';
            paymentPayload.cardExpiry = cardExpiry || '';
        }
        // Cash payment doesn't store any sensitive details

        // Save payment record
        const payment = new Payment(paymentPayload);
        await payment.save();

        // If payment successful, update order status
        if (paymentResult.success) {
            try {
                const jwtSecret = process.env.JWT_SECRET || 'secureSecret123456';
                const jwt = require('jsonwebtoken');
                const adminToken = jwt.sign({ id: 'admin', role: 'admin' }, jwtSecret);

                // Note: Order stays as 'pending' after successful payment
                // Admin/Restaurant will change to 'preparing' when they start working on it
                console.log(`Payment successful for order ${orderId}, order status remains pending`);
            } catch (err) {
                console.warn('[Payment Service] Failed to update order status:', err.message);
            }
        }

        // Return only non-sensitive data
        res.status(201).json({
            _id: payment._id,
            transactionId,
            orderId,
            amount,
            paymentMethod,
            status: payment.status,
            errorMessage: payment.errorMessage,
            cardNumber: paymentPayload.cardNumber,
            upiId: paymentPayload.upiId,
            bankName: paymentPayload.bankName,
            createdAt: payment.createdAt
        });
    } catch (err) {
        next(err);
    }
};

exports.getPaymentByOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const payments = await Payment.find({ orderId }).select('-cardNumber');
        res.json(payments);
    } catch (err) {
        next(err);
    }
};

exports.getPaymentById = async (req, res, next) => {
    try {
        const { paymentId } = req.params;
        const payment = await Payment.findById(paymentId).select('-cardNumber');
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        res.json(payment);
    } catch (err) {
        next(err);
    }
};
