module.exports = (sequelize, Sequelize) => {
  const Movie = sequelize.define("movies", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    posterImage: {
      type: Sequelize.STRING, // URL to image
      allowNull: true
    },
    duration: {
      type: Sequelize.INTEGER, // Duration in minutes
      allowNull: false
    },
    releaseDate: {
      type: Sequelize.DATEONLY,
      allowNull: true
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  });

  return Movie;
}; 