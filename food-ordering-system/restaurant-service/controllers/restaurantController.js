const Restaurant = require('../models/Restaurant');

exports.addRestaurant = async (req, res, next) => {
    try {
        const { name, address, cuisineType, lat, lng } = req.body;
        const image = req.file ? req.file.filename : null;

        if (!name || !address) return res.status(400).json({ error: 'Name and address are required' });

        const restaurant = new Restaurant({ 
            name, 
            address, 
            cuisineType, 
            image,
            location: {
                lat: lat ? parseFloat(lat) : undefined,
                lng: lng ? parseFloat(lng) : undefined
            }
        });
        await restaurant.save();
        res.status(201).json(restaurant);
    } catch (err) {
        next(err);
    }
};

exports.getRestaurants = async (req, res, next) => {
    try {
        const restaurants = await Restaurant.find();
        res.json(restaurants);
    } catch (err) {
        next(err);
    }
};

exports.updateRestaurant = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        
        if (req.file) {
            updateData.image = req.file.filename;
        }

        if (req.body.lat && req.body.lng) {
            updateData.location = {
                lat: parseFloat(req.body.lat),
                lng: parseFloat(req.body.lng)
            };
        }

        const restaurant = await Restaurant.findByIdAndUpdate(id, updateData, { new: true });
        res.json(restaurant);
    } catch (err) { next(err); }
};

exports.deleteRestaurant = async (req, res, next) => {
    try {
        const { id } = req.params;
        await Restaurant.findByIdAndDelete(id);
        res.json({ message: 'Restaurant deleted' });
    } catch (err) { next(err); }
};

exports.rateRestaurant = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId, score } = req.body;
        
        if(!userId || score == null || score < 1 || score > 5) {
            return res.status(400).json({ error: 'Valid userId and score (1-5) are required' });
        }

        const restaurant = await Restaurant.findById(id);
        if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

        const mongoose = require('mongoose');
        const objectIdUser = new mongoose.Types.ObjectId(userId);

        const existingRatingIndex = restaurant.ratings.findIndex(r => r.userId.toString() === userId.toString());
        if (existingRatingIndex >= 0) {
            restaurant.ratings[existingRatingIndex].score = score;
        } else {
            restaurant.ratings.push({ userId: objectIdUser, score });
        }

        const sum = restaurant.ratings.reduce((acc, curr) => acc + curr.score, 0);
        restaurant.averageRating = sum / restaurant.ratings.length;

        await restaurant.save();
        res.json({ message: 'Rating saved successfully', averageRating: restaurant.averageRating });
    } catch (err) { next(err); }
};
