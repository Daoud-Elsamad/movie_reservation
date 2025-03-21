const db = require('../models');
const User = db.user;
const ROLES = db.ROLES;

checkDuplicateUsernameOrEmail = async (req, res, next) => {
  try {
    // Check username
    let user = await User.findOne({
      where: {
        username: req.body.username
      }
    });

    if (user) {
      return res.status(400).send({
        message: 'Username is already in use!'
      });
    }

    // Check email
    user = await User.findOne({
      where: {
        email: req.body.email
      }
    });

    if (user) {
      return res.status(400).send({
        message: 'Email is already in use!'
      });
    }

    next();
  } catch (error) {
    return res.status(500).send({
      message: 'Unable to validate username/email!'
    });
  }
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        return res.status(400).send({
          message: `Role ${req.body.roles[i]} does not exist!`
        });
      }
    }
  }
  
  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted
};

module.exports = verifySignUp; 