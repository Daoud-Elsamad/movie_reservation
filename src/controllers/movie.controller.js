const db = require('../models');
const Movie = db.movie;
const Genre = db.genre;

exports.getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.findAll({
      include: [{
        model: Genre,
        as: 'genres',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }]
    });
    return res.status(200).send(movies);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

exports.getActiveMovies = async (req, res) => {
  try {
    const movies = await Movie.findAll({
      where: { isActive: true },
      include: [{
        model: Genre,
        as: 'genres',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }]
    });
    return res.status(200).send(movies);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id, {
      include: [{
        model: Genre,
        as: 'genres',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }]
    });
    
    if (!movie) {
      return res.status(404).send({ message: 'Movie not found!' });
    }
    
    return res.status(200).send(movie);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

exports.createMovie = async (req, res) => {
  try {
    // Create movie
    const movie = await Movie.create({
      title: req.body.title,
      description: req.body.description,
      posterImage: req.body.posterImage,
      duration: req.body.duration,
      releaseDate: req.body.releaseDate,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    });
    
    // Add genres if provided
    if (req.body.genres && req.body.genres.length > 0) {
      const genres = await Promise.all(req.body.genres.map(async (genreName) => {
        const [genre] = await Genre.findOrCreate({
          where: { name: genreName }
        });
        return genre;
      }));
      
      await movie.setGenres(genres);
    }
    
    // Return the created movie with its genres
    const createdMovie = await Movie.findByPk(movie.id, {
      include: [{
        model: Genre,
        as: 'genres',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }]
    });
    
    return res.status(201).send(createdMovie);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    
    if (!movie) {
      return res.status(404).send({ message: 'Movie not found!' });
    }
    
    // Update movie fields
    await movie.update({
      title: req.body.title || movie.title,
      description: req.body.description || movie.description,
      posterImage: req.body.posterImage || movie.posterImage,
      duration: req.body.duration || movie.duration,
      releaseDate: req.body.releaseDate || movie.releaseDate,
      isActive: req.body.isActive !== undefined ? req.body.isActive : movie.isActive
    });
    
    // Update genres if provided
    if (req.body.genres && req.body.genres.length > 0) {
      const genres = await Promise.all(req.body.genres.map(async (genreName) => {
        const [genre] = await Genre.findOrCreate({
          where: { name: genreName }
        });
        return genre;
      }));
      
      await movie.setGenres(genres);
    }
    
    // Return the updated movie with its genres
    const updatedMovie = await Movie.findByPk(movie.id, {
      include: [{
        model: Genre,
        as: 'genres',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }]
    });
    
    return res.status(200).send(updatedMovie);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    
    if (!movie) {
      return res.status(404).send({ message: 'Movie not found!' });
    }
    
    await movie.destroy();
    
    return res.status(200).send({
      message: 'Movie deleted successfully!'
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

exports.getMoviesByGenre = async (req, res) => {
  try {
    const genreName = req.params.genre;
    const genre = await Genre.findOne({
      where: { name: genreName }
    });
    
    if (!genre) {
      return res.status(404).send({ message: 'Genre not found!' });
    }
    
    const movies = await genre.getMovies({
      include: [{
        model: Genre,
        as: 'genres',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }]
    });
    
    return res.status(200).send(movies);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
}; 