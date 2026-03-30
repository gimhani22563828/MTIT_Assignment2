const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', adminAuth, upload.single('image'), restaurantController.addRestaurant);
router.get('/', restaurantController.getRestaurants);
router.put('/:id', adminAuth, upload.single('image'), restaurantController.updateRestaurant);
router.delete('/:id', adminAuth, restaurantController.deleteRestaurant);
router.post('/:id/rate', restaurantController.rateRestaurant);

module.exports = router;
