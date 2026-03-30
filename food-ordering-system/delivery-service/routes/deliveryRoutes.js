const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { auth, adminAuth } = require('../middleware/auth');

// Specific routes MUST come BEFORE generic routes
router.get('/order/:orderId', auth, deliveryController.getDeliveriesByOrder);
router.get('/user/:userId', auth, deliveryController.getDeliveriesByUser);

// Generic routes come last
router.post('/', adminAuth, deliveryController.createDelivery);
router.get('/', adminAuth, deliveryController.getAllDeliveries);
router.get('/:id', auth, deliveryController.getDeliveryById);
router.put('/:id/status', auth, deliveryController.updateDeliveryStatus);
router.put('/:id/assign', adminAuth, deliveryController.assignDeliveryPerson);
router.put('/:id/location', auth, deliveryController.updateDeliveryLocation);

module.exports = router;
