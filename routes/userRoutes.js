const express = require('express');
const authController = require('../controllers/authController');
const locationController = require('../controllers/locationController');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUser);
router.put('/updateMe', userController.updateMe);
router.put('/updateMyPassword', authController.updatePassword);

router.route('/:userId/locations')
            .get(locationController.getUserLocations)
            .post(locationController.setUserId, locationController.createLocation);

router.route('/:userId/locations/:locationId')
            .delete(locationController.setUserId, locationController.deleteLocation)
            .put(locationController.setUserId, locationController.updateLocation);

module.exports = router;