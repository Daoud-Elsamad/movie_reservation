const controller = require('../controllers/user.controller');
const { authJwt } = require('../middlewares');
const express = require('express');
const router = express.Router();
const db = require('../models');
const User = db.user;
const Role = db.role;

// Routes for both admin and regular users
router.get('/profile', [authJwt.verifyToken], async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Role,
        as: 'roles',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }]
    });
    
    if (!user) {
      return res.status(404).send({ message: 'User not found!' });
    }
    
    return res.status(200).send(user);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

// Admin routes
router.get('/', [authJwt.verifyToken, authJwt.isAdmin], controller.getAllUsers);
router.get('/:id', [authJwt.verifyToken, authJwt.isAdmin], controller.getUserById);
router.put('/:id', [authJwt.verifyToken, authJwt.isAdmin], controller.updateUser);
router.delete('/:id', [authJwt.verifyToken, authJwt.isAdmin], controller.deleteUser);
router.put('/:id/promote', [authJwt.verifyToken, authJwt.isAdmin], controller.promoteToAdmin);

module.exports = router; 