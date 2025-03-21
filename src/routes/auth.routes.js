const controller = require('../controllers/auth.controller');
const { verifySignUp } = require('../middlewares');
const express = require('express');
const router = express.Router();

router.post(
  '/signup',
  [
    verifySignUp.checkDuplicateUsernameOrEmail,
    verifySignUp.checkRolesExisted
  ],
  controller.signup
);

router.post('/signin', controller.signin);

module.exports = router; 