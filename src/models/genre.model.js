module.exports = (sequelize, Sequelize) => {
  const Genre = sequelize.define("genres", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    }
  });

  return Genre;
}; 