const controller = require('../controllers/movie.controller');
const { authJwt } = require('../middlewares');
const express = require('express');
const router = express.Router();

// Public routes
router.get('/active', controller.getActiveMovies);
router.get('/genre/:genre', controller.getMoviesByGenre);
router.get('/:id', controller.getMovieById);

// Admin routes
router.get('/', [authJwt.verifyToken, authJwt.isAdmin], controller.getAllMovies);
router.post('/', [authJwt.verifyToken, authJwt.isAdmin], controller.createMovie);
router.put('/:id', [authJwt.verifyToken, authJwt.isAdmin], controller.updateMovie);
router.delete('/:id', [authJwt.verifyToken, authJwt.isAdmin], controller.deleteMovie);

module.exports = router; 