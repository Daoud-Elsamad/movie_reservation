const dbConfig = require('../config/db.config');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.user = require('./user.model')(sequelize, Sequelize);
db.role = require('./role.model')(sequelize, Sequelize);
db.movie = require('./movie.model')(sequelize, Sequelize);
db.genre = require('./genre.model')(sequelize, Sequelize);
db.showtime = require('./showtime.model')(sequelize, Sequelize);
db.seat = require('./seat.model')(sequelize, Sequelize);
db.reservation = require('./reservation.model')(sequelize, Sequelize);

// Define relationships
db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId"
});

db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId"
});

db.movie.belongsToMany(db.genre, {
  through: "movie_genres",
  foreignKey: "movieId",
  otherKey: "genreId"
});

db.genre.belongsToMany(db.movie, {
  through: "movie_genres",
  foreignKey: "genreId",
  otherKey: "movieId"
});

db.showtime.belongsTo(db.movie, {
  foreignKey: "movieId"
});

db.movie.hasMany(db.showtime, {
  foreignKey: "movieId"
});

db.seat.belongsTo(db.showtime, {
  foreignKey: "showtimeId"
});

db.showtime.hasMany(db.seat, {
  foreignKey: "showtimeId"
});

db.reservation.belongsTo(db.user, {
  foreignKey: "userId"
});

db.user.hasMany(db.reservation, {
  foreignKey: "userId"
});

db.reservation.belongsTo(db.showtime, {
  foreignKey: "showtimeId"
});

db.showtime.hasMany(db.reservation, {
  foreignKey: "showtimeId"
});

db.reservation.belongsToMany(db.seat, {
  through: "reservation_seats",
  foreignKey: "reservationId",
  otherKey: "seatId"
});

db.seat.belongsToMany(db.reservation, {
  through: "reservation_seats",
  foreignKey: "seatId",
  otherKey: "reservationId"
});

db.ROLES = ["user", "admin"];

module.exports = db; 