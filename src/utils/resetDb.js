require('dotenv').config();
const db = require('../models');
const { initializeDB } = require('./dbInit');

async function resetDatabase() {
  try {
    console.log('Starting database reset...');
    
    // Force sync will drop all tables and recreate them
    await db.sequelize.sync({ force: true });
    console.log('Database structure has been reset');
    
    // Initialize database with roles and admin user
    await initializeDB();
    
    console.log('Database reset completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database reset failed:', error);
    process.exit(1);
  }
}

// Run the reset
resetDatabase(); 