const Order = require('../models/Order');
const axios = require('axios');

exports.createOrder = async (req, res, next) => {
    try {
        const { userId, restaurantId, items, totalAmount, location } = req.body;
        if (!userId || !restaurantId || !items || totalAmount === undefined || !location) {
             return res.status(400).json({ error: 'Missing required order fields including location' });
        }

        const order = new Order({ userId, restaurantId, items, totalAmount, location });
        await order.save();

        // Trigger delivery creation in delivery-service
        try {
            const jwtSecret = process.env.JWT_SECRET || 'secureSecret123456';
            const jwt = require('jsonwebtoken');
            const adminToken = jwt.sign({ id: 'admin', role: 'admin' }, jwtSecret);
            
            await axios.post('http://localhost:3005/deliveries', {
                orderId: order._id.toString(),
                userId: userId,
                address: location,
                deliveryAddress: location
            }, {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (deliveryError) {
            console.warn('[Order Service] Failed to create delivery:', deliveryError.message);
            // Don't fail the order creation if delivery creation fails
        }

        res.status(201).json(order);
    } catch (err) {
        next(err);
    }
};

exports.getAllOrders = async (req, res, next) => {
    try {
        // Get all orders
        const allOrders = await Order.find().sort({ createdAt: -1 });
        
        // Filter orders that have successful payments
        const ordersWithSuccessfulPayments = [];
        
        for (const order of allOrders) {
            try {
                // Check payment status for this order
                const paymentResponse = await axios.get(`http://localhost:3004/payments/${order._id}`, {
                    headers: {
                        'Authorization': req.headers.authorization
                    }
                });
                
                // Check if there's at least one successful payment for this order
                const payments = paymentResponse.data || [];
                const hasSuccessfulPayment = payments.some(payment => payment.status === 'Success');
                
                // Only include orders with successful payments
                if (hasSuccessfulPayment) {
                    ordersWithSuccessfulPayments.push(order);
                }
            } catch (paymentError) {
                // If payment check fails, don't include the order
                console.warn(`Failed to check payment for order ${order._id}:`, paymentError.message);
            }
        }
        
        res.json(ordersWithSuccessfulPayments);
    } catch (err) { next(err); }
};

exports.getOrdersByUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const mongoose = require('mongoose');
        
        console.log(`[Order Service backend] GET /orders/${userId}`);

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid userId format' });
        }

        // Get all orders for the user
        const allOrders = await Order.find({ userId });
        
        // Filter orders that have successful payments
        const ordersWithSuccessfulPayments = [];
        
        for (const order of allOrders) {
            try {
                // Check payment status for this order
                const paymentResponse = await axios.get(`http://localhost:3004/payments/${order._id}`, {
                    headers: {
                        'Authorization': req.headers.authorization
                    }
                });
                
                // Check if there's at least one successful payment for this order
                const payments = paymentResponse.data || [];
                const hasSuccessfulPayment = payments.some(payment => payment.status === 'Success');
                
                // Only include orders with successful payments
                if (hasSuccessfulPayment) {
                    ordersWithSuccessfulPayments.push(order);
                }
            } catch (paymentError) {
                // If payment check fails, don't include the order
                console.warn(`Failed to check payment for order ${order._id}:`, paymentError.message);
            }
        }
        
        res.json(ordersWithSuccessfulPayments);
    } catch (err) {
        next(err);
    }
};

exports.getOrderById = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const mongoose = require('mongoose');
        
        console.log(`[Order Service backend] GET /orders/details/${orderId}`);

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ error: 'Invalid orderId format' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (err) {
        next(err);
    }
};

exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { orderStatus, deliveryPersonId, deliveryPersonName, deliveryPersonPhone } = req.body;
        
        if (!orderStatus) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const validStatuses = ['pending', 'preparing', 'ready', 'picked', 'delivering', 'delivered', 'cancelled'];
        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        
        // Only admin can change preparing/ready status
        if (['preparing', 'ready'].includes(orderStatus) && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can set order to preparing/ready' });
        }

        // Only delivery person or admin can change picked/delivering/delivered status
        if (['picked', 'delivering', 'delivered'].includes(orderStatus)) {
            if (req.user.role !== 'deliveryPerson' && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Only delivery persons can update delivery status' });
            }
        }

        const updates = { orderStatus };
        if (deliveryPersonId) updates.deliveryPersonId = deliveryPersonId;
        if (deliveryPersonName) updates.deliveryPersonName = deliveryPersonName;
        if (deliveryPersonPhone) updates.deliveryPersonPhone = deliveryPersonPhone;
        if (orderStatus === 'delivered') updates.actualDeliveryTime = new Date();

        // When delivery person picks up a ready order, THEY get assigned (even if not assigned yet)
        if (orderStatus === 'picked' && req.user.role === 'deliveryPerson') {
            // Check if order is still unassigned
            if (order.deliveryPersonId && String(order.deliveryPersonId) !== String(req.user.id)) {
                console.warn(`[Order Service] Order already assigned to another delivery person`);
                return res.status(409).json({ 
                    error: 'This order was already picked by another delivery person',
                    order: order
                });
            }
            console.log(`[Order Service] Assigning delivery person ${req.user.id} to order on pickup`);
            updates.deliveryPersonId = req.user.id;
        }

        // When admin marks order as ready, auto-assign an available delivery person if not already assigned
        if (orderStatus === 'ready' && !deliveryPersonId && !order.deliveryPersonId) {
            try {
                const jwtSecret = process.env.JWT_SECRET || 'secureSecret123456';
                const jwt = require('jsonwebtoken');
                const adminToken = jwt.sign({ id: 'admin', role: 'admin' }, jwtSecret);
                
                const response = await axios.get('http://localhost:3001/users/delivery-persons/available', {
                    headers: { 'Authorization': `Bearer ${adminToken}` }
                });

                if (response.data && response.data.length > 0) {
                    const deliveryPerson = response.data[0];
                    updates.deliveryPersonId = deliveryPerson._id;
                    updates.deliveryPersonName = deliveryPerson.name;
                    updates.deliveryPersonPhone = deliveryPerson.phone;
                    console.log(`[Order Service] Auto-assigned delivery person on mark ready: ${deliveryPerson.name}`);
                }
            } catch (assignmentError) {
                console.warn('[Order Service] Failed to assign delivery person:', assignmentError.message);
                // Continue without auto-assignment if service unavailable
            }
        }

        const updatedOrder = await Order.findByIdAndUpdate(id, updates, { new: true });
        res.json({ message: 'Order status updated successfully', order: updatedOrder });
    } catch (err) {
        next(err);
    }
};

exports.changeOrderToReady = async (req, res, next) => {
    try {
        // Admin only
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can mark orders as ready' });
        }

        const { id } = req.params;
        const order = await Order.findById(id);
        
        if (!order) return res.status(404).json({ error: 'Order not found' });
        
        // Allow transition from pending or preparing to ready
        if (!['pending', 'preparing'].includes(order.orderStatus)) {
            return res.status(400).json({ error: 'Order must be in pending or preparing status to move to ready' });
        }

        // Mark as ready WITHOUT assigning a delivery person
        // Any available delivery person can pick this up
        const updates = { orderStatus: 'ready' };
        
        const updatedOrder = await Order.findByIdAndUpdate(id, updates, { new: true });
        console.log(`[Order Service] Order ${id} marked as ready (unassigned)`);
        res.json({ 
            message: 'Order marked ready. Any delivery person can pick it up.',
            order: updatedOrder 
        });
    } catch (err) {
        next(err);
    }
};

exports.getOrdersForDeliveryPerson = async (req, res, next) => {
    try {
        const { deliveryPersonId } = req.params;
        
        console.log(`[Order Service] Getting orders for delivery person: ${deliveryPersonId}`);
        console.log(`[Order Service] Current user: ${req.user.id}, Role: ${req.user.role}`);
        
        // Convert both to strings for comparison
        const requestedUserId = String(deliveryPersonId);
        const currentUserId = String(req.user.id);
        
        // Delivery person can only see their own orders
        if (currentUserId !== requestedUserId && req.user.role !== 'admin') {
            console.warn(`[Order Service] Access denied - User ${currentUserId} trying to access ${requestedUserId}`);
            return res.status(403).json({ error: 'Access denied' });
        }

        // Debug: Check ALL ready orders in DB
        const allReadyOrders = await Order.find({ orderStatus: 'ready' });
        console.log(`[Order Service] DEBUG: Total ready orders in DB: ${allReadyOrders.length}`);
        allReadyOrders.forEach(o => {
            console.log(`  - Order ${o._id}: deliveryPersonId=${o.deliveryPersonId}, status=${o.orderStatus}`);
        });

        // Get orders:
        // 1. ALL ready orders (visible to every delivery person, regardless of assignment)
        // 2. Orders assigned to this delivery person (picked, delivering)
        const orders = await Order.find({
            $or: [
                // ALL ready orders - every delivery person can see and pick these
                {
                    orderStatus: 'ready'
                },
                // Orders already assigned to this delivery person
                {
                    deliveryPersonId: deliveryPersonId,
                    orderStatus: { $in: ['picked', 'delivering'] }
                }
            ]
        }).sort({ createdAt: -1 });

        console.log(`[Order Service] Found ${orders.length} orders for delivery person ${deliveryPersonId}`);
        orders.forEach(o => {
            console.log(`  - Order ${o._id}: status=${o.orderStatus}, deliveryPersonId=${o.deliveryPersonId}`);
        });
        res.json(orders);
    } catch (err) {
        console.error('[Order Service] Error fetching orders for delivery person:', err);
        next(err);
    }
};

// Debug endpoint to see all ready orders and their assignments
exports.getDebugReadyOrders = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin only' });
        }

        const readyOrders = await Order.find({ orderStatus: 'ready' }).sort({ createdAt: -1 });
        
        console.log(`[Debug] Found ${readyOrders.length} ready orders:`);
        readyOrders.forEach(order => {
            console.log(`  Order ${order._id}: deliveryPersonId=${order.deliveryPersonId}, deliveryPersonName=${order.deliveryPersonName}`);
        });

        res.json({
            count: readyOrders.length,
            orders: readyOrders.map(o => ({
                id: o._id,
                status: o.orderStatus,
                deliveryPersonId: o.deliveryPersonId,
                deliveryPersonName: o.deliveryPersonName,
                deliveryPersonPhone: o.deliveryPersonPhone,
                location: o.location
            }))
        });
    } catch (err) {
        console.error('[Order Service] Debug error:', err);
        next(err);
    }
};

// Admin endpoint to cleanup: remove deliveryPersonId from all ready orders
// This allows any delivery person to pick them up
exports.cleanupReadyOrders = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin only' });
        }

        const result = await Order.updateMany(
            { orderStatus: 'ready', deliveryPersonId: { $ne: null } },
            { $set: { deliveryPersonId: null, deliveryPersonName: null, deliveryPersonPhone: null } }
        );

        console.log(`[Order Service] Cleanup: Cleared deliveryPersonId from ${result.modifiedCount} ready orders`);
        res.json({
            message: `Cleaned up ${result.modifiedCount} ready orders`,
            modifiedCount: result.modifiedCount
        });
    } catch (err) {
        console.error('[Order Service] Cleanup error:', err);
        next(err);
    }
};
