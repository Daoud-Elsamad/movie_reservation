require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');
const authRoutes = require('./routes/auth.routes');
const movieRoutes = require('./routes/movie.routes');
const showtimeRoutes = require('./routes/showtime.routes');
const reservationRoutes = require('./routes/reservation.routes');
const userRoutes = require('./routes/user.routes');
const { initializeDB } = require('./utils/dbInit');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/users', userRoutes);

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Movie Reservation System API' });
});

// Set port and start the server
const PORT = process.env.PORT || 8080;

db.sequelize.sync({ force: false }).then(async () => {
  // Initialize database with roles and admin user
  await initializeDB();
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
}); 