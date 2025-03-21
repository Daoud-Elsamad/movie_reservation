const controller = require('../controllers/showtime.controller');
const { authJwt } = require('../middlewares');
const express = require('express');
const router = express.Router();

// Public routes
router.get('/date/:date', controller.getShowtimesByDate);
router.get('/movie/:movieId', controller.getShowtimesByMovie);
router.get('/:id', controller.getShowtimeById);
router.get('/:id/seats', controller.getSeatsForShowtime);

// Admin routes
router.get('/', [authJwt.verifyToken, authJwt.isAdmin], controller.getAllShowtimes);
router.post('/', [authJwt.verifyToken, authJwt.isAdmin], controller.createShowtime);
router.put('/:id', [authJwt.verifyToken, authJwt.isAdmin], controller.updateShowtime);
router.delete('/:id', [authJwt.verifyToken, authJwt.isAdmin], controller.deleteShowtime);

module.exports = router; 