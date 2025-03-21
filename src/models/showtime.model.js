module.exports = (sequelize, Sequelize) => {
  const Showtime = sequelize.define("showtimes", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    movieId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    startTime: {
      type: Sequelize.DATE,
      allowNull: false
    },
    endTime: {
      type: Sequelize.DATE,
      allowNull: false
    },
    theater: {
      type: Sequelize.INTEGER, // Theater number
      allowNull: false
    },
    ticketPrice: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    totalSeats: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  });

  return Showtime;
}; 