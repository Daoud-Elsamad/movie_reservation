const db = require('../models');
const User = db.user;
const Role = db.role;

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [{
        model: Role,
        as: 'roles',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }]
    });
    return res.status(200).send(users);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
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
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).send({ message: 'User not found!' });
    }
    
    // Update user fields
    await user.update({
      firstName: req.body.firstName || user.firstName,
      lastName: req.body.lastName || user.lastName,
      phoneNumber: req.body.phoneNumber || user.phoneNumber,
      email: req.body.email || user.email
    });
    
    return res.status(200).send({
      message: 'User updated successfully!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

exports.promoteToAdmin = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).send({ message: 'User not found!' });
    }
    
    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    const userRoles = await user.getRoles();
    
    // Check if user already has admin role
    for (let i = 0; i < userRoles.length; i++) {
      if (userRoles[i].name === 'admin') {
        return res.status(400).send({
          message: 'User already has admin role!'
        });
      }
    }
    
    // Add admin role
    await user.addRole(adminRole);
    
    return res.status(200).send({
      message: `User ${user.username} promoted to admin successfully!`
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).send({ message: 'User not found!' });
    }
    
    await user.destroy();
    
    return res.status(200).send({
      message: 'User deleted successfully!'
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
}; 