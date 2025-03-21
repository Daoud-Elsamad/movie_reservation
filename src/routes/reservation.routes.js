const controller = require('../controllers/reservation.controller');
const { authJwt } = require('../middlewares');
const express = require('express');
const router = express.Router();

// User routes
router.post('/', [authJwt.verifyToken], controller.createReservation);
router.get('/user', [authJwt.verifyToken], controller.getUserReservations);
router.get('/user/upcoming', [authJwt.verifyToken], controller.getUserUpcomingReservations);
router.put('/:id/cancel', [authJwt.verifyToken], controller.cancelReservation);

// Admin routes
router.get('/', [authJwt.verifyToken, authJwt.isAdmin], controller.getAllReservations);
router.get('/reports', [authJwt.verifyToken, authJwt.isAdmin], controller.getReservationReports);
router.get('/:id', [authJwt.verifyToken, authJwt.isAdmin], controller.getReservationById);

module.exports = router; 