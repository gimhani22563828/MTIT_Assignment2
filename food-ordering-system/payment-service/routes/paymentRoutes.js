const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/', paymentController.processPayment);
router.get('/:orderId', paymentController.getPaymentByOrder);
router.get('/payment/:paymentId', paymentController.getPaymentById);

module.exports = router;
