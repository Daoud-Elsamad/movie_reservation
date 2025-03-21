module.exports = (sequelize, Sequelize) => {
  const Reservation = sequelize.define("reservations", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    showtimeId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    totalAmount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: Sequelize.ENUM('pending', 'confirmed', 'cancelled'),
      defaultValue: 'confirmed'
    },
    reservationDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  });

  return Reservation;
}; 