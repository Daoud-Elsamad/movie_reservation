const db = require('../models');
const User = db.user;
const Role = db.role;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  try {
    // Create user
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber
    });

    // Assign role
    if (req.body.roles) {
      const roles = await Role.findAll({
        where: {
          name: {
            [db.Sequelize.Op.or]: req.body.roles
          }
        }
      });
      
      await user.setRoles(roles);
      return res.status(201).send({ 
        message: 'User registered successfully!',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: req.body.roles
        }
      });
    } else {
      // Default role is 'user'
      const role = await Role.findOne({
        where: {
          name: 'user'
        }
      });
      
      await user.setRoles([role]);
      return res.status(201).send({ 
        message: 'User registered successfully!',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: ['user']
        }
      });
    }
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        username: req.body.username
      }
    });

    if (!user) {
      return res.status(404).send({ message: 'User not found!' });
    }

    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: 'Invalid password!'
      });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: parseInt(process.env.JWT_EXPIRATION) }
    );

    const roles = await user.getRoles();
    const authorities = roles.map(role => `ROLE_${role.name.toUpperCase()}`);

    return res.status(200).send({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: authorities,
      accessToken: token
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
}; 