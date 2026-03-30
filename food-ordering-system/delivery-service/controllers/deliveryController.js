const Delivery = require('../models/Delivery');

// Create Delivery
exports.createDelivery = async (req, res, next) => {
    try {
        const { orderId, userId, address, deliveryAddress } = req.body;
        if (!orderId || !userId || !address || !deliveryAddress) {
            return res.status(400).json({ error: 'Missing required delivery fields' });
        }

        const delivery = new Delivery({ 
            orderId, 
            userId, 
            address,
            deliveryAddress,
            status: 'pending',
            estimatedDeliveryTime: 30
        });
        await delivery.save();
        res.status(201).json({ message: 'Delivery created successfully', delivery });
    } catch (err) {
        console.error('Create delivery error:', err);
        next(err);
    }
};

// Get Delivery by ID
exports.getDeliveryById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'Delivery ID is required' });
        }
        const delivery = await Delivery.findById(id);
        if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
        res.json(delivery);
    } catch (err) {
        console.error('Get delivery error:', err);
        next(err);
    }
};

// Get Deliveries by User
exports.getDeliveriesByUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        const deliveries = await Delivery.find({ userId }).sort({ createdAt: -1 });
        res.json(deliveries);
    } catch (err) {
        console.error('Get deliveries by user error:', err);
        next(err);
    }
};

// Get Delivery by Order
exports.getDeliveriesByOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }
        const delivery = await Delivery.findOne({ orderId });
        if (!delivery) return res.status(404).json({ error: 'Delivery not found for this order' });
        res.json(delivery);
    } catch (err) {
        console.error('Get delivery by order error:', err);
        next(err);
    }
};

// Update Delivery Status
exports.updateDeliveryStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, deliveryPersonId, deliveryPersonName, deliveryPersonPhone } = req.body;
        
        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const validStatuses = ['pending', 'assigned', 'in-transit', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const updates = { status };
        if (deliveryPersonId) updates.deliveryPersonId = deliveryPersonId;
        if (deliveryPersonName) updates.deliveryPersonName = deliveryPersonName;
        if (deliveryPersonPhone) updates.deliveryPersonPhone = deliveryPersonPhone;
        if (status === 'delivered') updates.actualDeliveryTime = new Date();

        const delivery = await Delivery.findByIdAndUpdate(id, updates, { new: true });
        if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
        
        res.json({ message: 'Delivery status updated successfully', delivery });
    } catch (err) {
        console.error('Update delivery status error:', err);
        next(err);
    }
};

// Get All Deliveries
exports.getAllDeliveries = async (req, res, next) => {
    try {
        const deliveries = await Delivery.find().sort({ createdAt: -1 });
        res.json(deliveries);
    } catch (err) {
        console.error('Get all deliveries error:', err);
        next(err);
    }
};

// Assign Delivery Person
exports.assignDeliveryPerson = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { deliveryPersonId, deliveryPersonName, deliveryPersonPhone } = req.body;
        
        if (!deliveryPersonId || !deliveryPersonName || !deliveryPersonPhone) {
            return res.status(400).json({ error: 'Delivery person details are required' });
        }

        const delivery = await Delivery.findByIdAndUpdate(
            id, 
            { 
                deliveryPersonId, 
                deliveryPersonName, 
                deliveryPersonPhone,
                status: 'assigned'
            }, 
            { new: true }
        );
        
        if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
        res.json({ message: 'Delivery partner assigned successfully', delivery });
    } catch (err) {
        console.error('Assign delivery person error:', err);
        next(err);
    }
};

// Update Delivery Location
exports.updateDeliveryLocation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { latitude, longitude } = req.body;
        
        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        // Validate coordinates
        if (latitude < -90 || latitude > 90) {
            return res.status(400).json({ error: 'Latitude must be between -90 and 90' });
        }
        if (longitude < -180 || longitude > 180) {
            return res.status(400).json({ error: 'Longitude must be between -180 and 180' });
        }

        const delivery = await Delivery.findByIdAndUpdate(
            id,
            { latitude, longitude },
            { new: true }
        );
        
        if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
        res.json({ message: 'Location updated successfully', delivery });
    } catch (err) {
        console.error('Update delivery location error:', err);
        next(err);
    }
};
