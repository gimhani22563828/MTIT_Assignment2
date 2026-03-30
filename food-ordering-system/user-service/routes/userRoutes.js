const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/delivery-persons', auth, userController.getAllDeliveryPersons);
router.get('/delivery-persons/available', auth, userController.getAvailableDeliveryPersons);
router.get('/:id', userController.getProfile);

module.exports = router;
