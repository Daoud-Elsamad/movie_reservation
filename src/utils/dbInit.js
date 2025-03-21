const db = require('../models');
const bcrypt = require('bcrypt');

const Role = db.role;
const User = db.user;

/**
 * Initialize database with roles and admin user
 */
exports.initializeDB = async () => {
  try {
    // Create roles if they don't exist
    const roles = await Role.findAll();
    
    if (roles.length === 0) {
      await Promise.all([
        Role.create({ name: 'user' }),
        Role.create({ name: 'admin' })
      ]);
      console.log('Roles created successfully!');
    }
    
    // Create admin user if it doesn't exist
    const adminExists = await User.findOne({
      where: { username: 'admin' }
    });
    
    if (!adminExists) {
      // Create admin user
      const admin = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: bcrypt.hashSync('admin123', 8),
        firstName: 'System',
        lastName: 'Admin'
      });
      
      // Assign admin role
      const adminRole = await Role.findOne({ where: { name: 'admin' } });
      await admin.setRoles([adminRole]);
      
      console.log('Admin user created successfully!');
    }
    
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}; 