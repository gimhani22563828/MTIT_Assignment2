const Menu = require('../models/Menu');

exports.addMenu = async (req, res, next) => {
    try {
        const { restaurantId, name, description, price } = req.body;
        if (!restaurantId || !name || price === undefined) {
             return res.status(400).json({ error: 'RestaurantId, name and price are required' });
        }

        let image = '';
        if (req.file) {
            image = req.file.filename;
        }

        const menu = new Menu({ restaurantId, name, description, price, image });
        await menu.save();
        res.status(201).json(menu);
    } catch (err) {
        next(err);
    }
};

exports.getMenuByRestaurant = async (req, res, next) => {
    try {
        const { restaurantId } = req.params;
        const menu = await Menu.find({ restaurantId });
        res.json(menu);
    } catch (err) {
        next(err);
    }
};

exports.updateMenu = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        if (req.file) updateData.image = req.file.filename;
        
        const menu = await Menu.findByIdAndUpdate(id, updateData, { new: true });
        res.json(menu);
    } catch (err) { next(err); }
};

exports.deleteMenu = async (req, res, next) => {
    try {
        const { id } = req.params;
        await Menu.findByIdAndDelete(id);
        res.json({ message: 'Menu deleted' });
    } catch (err) { next(err); }
};

exports.getAllMenu = async (req, res, next) => {
    try {
        const menu = await Menu.find().populate('restaurantId', 'name');
        res.json(menu);
    } catch (err) { next(err); }
};

exports.rateMenu = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId, score } = req.body;
        
        if(!userId || score == null || score < 1 || score > 5) {
            return res.status(400).json({ error: 'Valid userId and score (1-5) are required' });
        }

        const menu = await Menu.findById(id);
        if (!menu) return res.status(404).json({ error: 'Menu item not found' });

        const mongoose = require('mongoose');
        const objectIdUser = new mongoose.Types.ObjectId(userId);

        const existingRatingIndex = menu.ratings.findIndex(r => r.userId.toString() === userId.toString());
        if (existingRatingIndex >= 0) {
            menu.ratings[existingRatingIndex].score = score;
        } else {
            menu.ratings.push({ userId: objectIdUser, score });
        }

        const sum = menu.ratings.reduce((acc, curr) => acc + curr.score, 0);
        menu.averageRating = sum / menu.ratings.length;

        await menu.save();
        res.json({ message: 'Rating saved successfully', averageRating: menu.averageRating });
    } catch (err) { next(err); }
};
