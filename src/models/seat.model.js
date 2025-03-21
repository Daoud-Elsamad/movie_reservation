module.exports = (sequelize, Sequelize) => {
  const Seat = sequelize.define("seats", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    showtimeId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    row: {
      type: Sequelize.STRING, // A, B, C...
      allowNull: false
    },
    number: {
      type: Sequelize.INTEGER, // 1, 2, 3...
      allowNull: false
    },
    isReserved: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    type: {
      type: Sequelize.ENUM('standard', 'premium', 'vip'),
      defaultValue: 'standard'
    }
  });

  return Seat;
}; 