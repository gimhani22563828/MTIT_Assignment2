const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, phone, role } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });
        
        // Delivery person must have phone
        if (role === 'deliveryPerson' && !phone) {
            return res.status(400).json({ error: 'Phone number is required for delivery persons' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role || 'user';
        
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: userRole,
            phone: phone || null,
            isAvailable: userRole === 'deliveryPerson' ? true : undefined
        });
        
        await user.save();
        
        res.status(201).json({ 
            message: 'User registered successfully', 
            userId: user._id,
            role: user.role
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'All fields are required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ message: 'Login successful', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        next(error);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        next(error);
    }
};

exports.getAvailableDeliveryPersons = async (req, res, next) => {
    try {
        // Only admin can get list of delivery persons
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can view delivery persons' });
        }

        const deliveryPersons = await User.find({
            role: 'deliveryPerson',
            isAvailable: true
        }).select('-password');

        res.json(deliveryPersons);
    } catch (error) {
        next(error);
    }
};

exports.getAllDeliveryPersons = async (req, res, next) => {
    try {
        // Only admin can get list of delivery persons
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can view delivery persons' });
        }

        const deliveryPersons = await User.find({
            role: 'deliveryPerson'
        }).select('-password');

        res.json(deliveryPersons);
    } catch (error) {
        next(error);
    }
};
