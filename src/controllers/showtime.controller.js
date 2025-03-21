const db = require('../models');
const Showtime = db.showtime;
const Movie = db.movie;
const Seat = db.seat;
const { Op } = db.Sequelize;

exports.getAllShowtimes = async (req, res) => {
  try {
    const showtimes = await Showtime.findAll({
      include: [{
        model: Movie,
        attributes: ['id', 'title', 'posterImage', 'duration']
      }]
    });
    return res.status(200).send(showtimes);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

exports.getShowtimeById = async (req, res) => {
  try {
    const showtime = await Showtime.findByPk(req.params.id, {
      include: [{
        model: Movie,
        attributes: ['id', 'title', 'posterImage', 'duration']
      }]
    });
    
    if (!showtime) {
      return res.status(404).send({ message: 'Showtime not found!' });
    }
    
    return res.status(200).send(showtime);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

exports.getShowtimesByDate = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    if (isNaN(date.getTime())) {
      return res.status(400).send({ message: 'Invalid date format!' });
    }
    
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const showtimes = await Showtime.findAll({
      where: {
        startTime: {
          [Op.between]: [startDate, endDate]
        },
        isActive: true
      },
      include: [{
        model: Movie,
        attributes: ['id', 'title', 'posterImage', 'duration']
      }],
      order: [['startTime', 'ASC']]
    });
    
    return res.status(200).send(showtimes);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

exports.getShowtimesByMovie = async (req, res) => {
  try {
    const movieId = req.params.movieId;
    
    const showtimes = await Showtime.findAll({
      where: {
        movieId: movieId,
        startTime: {
          [Op.gte]: new Date()
        },
        isActive: true
      },
      include: [{
        model: Movie,
        attributes: ['id', 'title', 'posterImage', 'duration']
      }],
      order: [['startTime', 'ASC']]
    });
    
    return res.status(200).send(showtimes);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

exports.createShowtime = async (req, res) => {
  try {
    // Check if movie exists
    const movieExists = await Movie.findByPk(req.body.movieId);
    if (!movieExists) {
      return res.status(404).send({ message: 'Movie not found!' });
    }
    
    // Check if theater is available at the time
    const startTime = new Date(req.body.startTime);
    const endTime = new Date(req.body.endTime);
    
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return res.status(400).send({ message: 'Invalid date format!' });
    }
    
    // Check if the theater is already booked for this time period
    const conflictingShowtime = await Showtime.findOne({
      where: {
        theater: req.body.theater,
        [Op.or]: [
          {
            startTime: {
              [Op.between]: [startTime, endTime]
            }
          },
          {
            endTime: {
              [Op.between]: [startTime, endTime]
            }
          },
          {
            [Op.and]: [
              { startTime: { [Op.lte]: startTime } },
              { endTime: { [Op.gte]: endTime } }
            ]
          }
        ]
      }
    });
    
    if (conflictingShowtime) {
      return res.status(400).send({ 
        message: 'Theater is already booked for this time period!',
        conflict: conflictingShowtime
      });
    }
    
    // Create showtime
    const showtime = await Showtime.create({
      movieId: req.body.movieId,
      startTime: startTime,
      endTime: endTime,
      theater: req.body.theater,
      ticketPrice: req.body.ticketPrice,
      totalSeats: req.body.totalSeats,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    });
    
    // Create seats for the showtime
    const seatRows = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const rowsNeeded = Math.ceil(req.body.totalSeats / 10); // Assuming 10 seats per row
    
    // Create all seats at once with bulkCreate
    const seatsToCreate = [];
    
    for (let i = 0; i < rowsNeeded && i < seatRows.length; i++) {
      const row = seatRows[i];
      const seatsInThisRow = i === rowsNeeded - 1 ? 
        (req.body.totalSeats % 10 === 0 ? 10 : req.body.totalSeats % 10) : 
        10;
      
      for (let j = 1; j <= seatsInThisRow; j++) {
        // Determine seat type - just an example, can be customized
        let seatType = 'standard';
        if (i === 0) seatType = 'premium'; // First row is premium
        if (i === Math.floor(rowsNeeded / 2) && j >= 3 && j <= 8) seatType = 'vip'; // Middle seats in middle row are VIP
        
        seatsToCreate.push({
          showtimeId: showtime.id,
          row: row,
          number: j,
          isReserved: false,
          type: seatType
        });
      }
    }
    
    await Seat.bulkCreate(seatsToCreate);
    
    // Return the created showtime with its movie
    const createdShowtime = await Showtime.findByPk(showtime.id, {
      include: [{
        model: Movie,
        attributes: ['id', 'title', 'posterImage', 'duration']
      }]
    });
    
    return res.status(201).send(createdShowtime);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

exports.updateShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.findByPk(req.params.id);
    
    if (!showtime) {
      return res.status(404).send({ message: 'Showtime not found!' });
    }
    
    const startTime = req.body.startTime ? new Date(req.body.startTime) : showtime.startTime;
    const endTime = req.body.endTime ? new Date(req.body.endTime) : showtime.endTime;
    const theater = req.body.theater || showtime.theater;
    
    // Check if the theater is already booked for this time period (if changed)
    if (req.body.startTime || req.body.endTime || req.body.theater) {
      const conflictingShowtime = await Showtime.findOne({
        where: {
          id: { [Op.ne]: showtime.id }, // Exclude current showtime
          theater: theater,
          [Op.or]: [
            {
              startTime: {
                [Op.between]: [startTime, endTime]
              }
            },
            {
              endTime: {
                [Op.between]: [startTime, endTime]
              }
            },
            {
              [Op.and]: [
                { startTime: { [Op.lte]: startTime } },
                { endTime: { [Op.gte]: endTime } }
              ]
            }
          ]
        }
      });
      
      if (conflictingShowtime) {
        return res.status(400).send({ 
          message: 'Theater is already booked for this time period!',
          conflict: conflictingShowtime
        });
      }
    }
    
    // Update showtime
    await showtime.update({
      movieId: req.body.movieId || showtime.movieId,
      startTime: startTime,
      endTime: endTime,
      theater: theater,
      ticketPrice: req.body.ticketPrice || showtime.ticketPrice,
      isActive: req.body.isActive !== undefined ? req.body.isActive : showtime.isActive
    });
    
    // Return the updated showtime with its movie
    const updatedShowtime = await Showtime.findByPk(showtime.id, {
      include: [{
        model: Movie,
        attributes: ['id', 'title', 'posterImage', 'duration']
      }]
    });
    
    return res.status(200).send(updatedShowtime);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

exports.deleteShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.findByPk(req.params.id);
    
    if (!showtime) {
      return res.status(404).send({ message: 'Showtime not found!' });
    }
    
    await showtime.destroy();
    
    return res.status(200).send({
      message: 'Showtime deleted successfully!'
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

exports.getSeatsForShowtime = async (req, res) => {
  try {
    const showtimeId = req.params.id;
    
    const showtime = await Showtime.findByPk(showtimeId);
    if (!showtime) {
      return res.status(404).send({ message: 'Showtime not found!' });
    }
    
    const seats = await Seat.findAll({
      where: { showtimeId: showtimeId },
      order: [['row', 'ASC'], ['number', 'ASC']]
    });
    
    return res.status(200).send(seats);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
}; 