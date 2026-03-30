const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { adminAuth, auth } = require('../middleware/auth');

router.post('/', auth, orderController.createOrder);
router.get('/', adminAuth, orderController.getAllOrders);
router.get('/debug/ready-orders', adminAuth, orderController.getDebugReadyOrders);
router.post('/admin/cleanup-ready-orders', adminAuth, orderController.cleanupReadyOrders);
// Specific routes BEFORE generic routes
router.get('/details/:orderId', auth, orderController.getOrderById);
router.get('/delivery-person/:deliveryPersonId', auth, orderController.getOrdersForDeliveryPerson);
router.put('/:id/ready', adminAuth, orderController.changeOrderToReady);
// Generic routes after specific
router.get('/:userId', auth, orderController.getOrdersByUser);
router.put('/:id/status', auth, orderController.updateOrderStatus);

module.exports = router;
