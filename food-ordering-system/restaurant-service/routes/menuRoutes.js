const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', adminAuth, upload.single('image'), menuController.addMenu);
router.get('/', menuController.getAllMenu);
router.get('/:restaurantId', menuController.getMenuByRestaurant);
router.put('/:id', adminAuth, upload.single('image'), menuController.updateMenu);
router.delete('/:id', adminAuth, menuController.deleteMenu);
router.post('/:id/rate', menuController.rateMenu);

module.exports = router;
