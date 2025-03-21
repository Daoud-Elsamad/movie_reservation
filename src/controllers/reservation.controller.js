const db = require('../models');
const Reservation = db.reservation;
const Showtime = db.showtime;
const Seat = db.seat;
const User = db.user;
const Movie = db.movie;
const { Op } = db.Sequelize;

exports.createReservation = async (req, res) => {
  // Start transaction to ensure data consistency
  const transaction = await db.sequelize.transaction();

  try {
    const { showtimeId, seatIds } = req.body;
    const userId = req.userId; // From JWT authentication
    
    // Check if showtime exists
    const showtime = await Showtime.findByPk(showtimeId, { transaction });
    if (!showtime) {
      await transaction.rollback();
      return res.status(404).send({ message: 'Showtime not found!' });
    }
    
    // Check if showtime is in the past
    if (new Date(showtime.startTime) < new Date()) {
      await transaction.rollback();
      return res.status(400).send({ message: 'Cannot book tickets for past showtimes!' });
    }
    
    // Check if all seats exist and are not already reserved
    const seats = await Seat.findAll({
      where: {
        id: { [Op.in]: seatIds },
        showtimeId: showtimeId
      },
      transaction
    });
    
    if (seats.length !== seatIds.length) {
      await transaction.rollback();
      return res.status(404).send({ message: 'One or more seats not found!' });
    }
    
    const reservedSeats = seats.filter(seat => seat.isReserved);
    if (reservedSeats.length > 0) {
      await transaction.rollback();
      return res.status(400).send({ 
        message: 'Some seats are already reserved!',
        reservedSeats: reservedSeats.map(seat => `${seat.row}${seat.number}`)
      });
    }
    
    // Calculate total amount
    let totalAmount = seats.length * parseFloat(showtime.ticketPrice);
    
    // Apply seat type pricing (premium/vip seats cost more)
    for (const seat of seats) {
      if (seat.type === 'premium') {
        totalAmount += parseFloat(showtime.ticketPrice) * 0.2; // 20% more for premium
      } else if (seat.type === 'vip') {
        totalAmount += parseFloat(showtime.ticketPrice) * 0.5; // 50% more for VIP
      }
    }
    
    // Create reservation
    const reservation = await Reservation.create({
      userId: userId,
      showtimeId: showtimeId,
      totalAmount: totalAmount,
      status: 'confirmed',
      reservationDate: new Date()
    }, { transaction });
    
    // Associate seats with reservation
    await reservation.addSeats(seats, { transaction });
    
    // Mark seats as reserved
    await Promise.all(seats.map(seat => 
      seat.update({ isReserved: true }, { transaction })
    ));
    
    // Commit transaction
    await transaction.commit();
    
    // Return complete reservation with seats
    const completeReservation = await Reservation.findByPk(reservation.id, {
      include: [
        {
          model: Seat,
          as: 'seats',
          through: { attributes: [] }
        },
        {
          model: Showtime,
          include: [{
            model: Movie,
            attributes: ['id', 'title']
          }]
        }
      ]
    });
    
    return res.status(201).send(completeReservation);
  } catch (error) {
    await transaction.rollback();
    return res.status(500).send({ message: error.message });
  }
};

exports.getUserReservations = async (req, res) => {
  try {
    const userId = req.userId; // From JWT authentication
    
    const reservations = await Reservation.findAll({
      where: { userId: userId },
      include: [
        {
          model: Seat,
          as: 'seats',
          through: { attributes: [] }
        },
        {
          model: Showtime,
          include: [{
            model: Movie,
            attributes: ['id', 'title', 'posterImage']
          }]
        }
      ],
      order: [['reservationDate', 'DESC']]
    });
    
    return res.status(200).send(reservations);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

exports.getUserUpcomingReservations = async (req, res) => {
  try {
    const userId = req.userId; // From JWT authentication
    const now = new Date();
    
    const reservations = await Reservation.findAll({
      where: { userId: userId },
      include: [
        {
          model: Seat,
          as: 'seats',
          through: { attributes: [] }
        },
        {
          model: Showtime,
          where: {
            startTime: { [Op.gt]: now }
          },
          include: [{
            model: Movie,
            attributes: ['id', 'title', 'posterImage']
          }]
        }
      ],
      order: [[Showtime, 'startTime', 'ASC']]
    });
    
    return res.status(200).send(reservations);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

exports.cancelReservation = async (req, res) => {
  // Start transaction to ensure data consistency
  const transaction = await db.sequelize.transaction();
  
  try {
    const reservationId = req.params.id;
    const userId = req.userId; // From JWT authentication
    
    // Find reservation
    const reservation = await Reservation.findByPk(reservationId, {
      include: [{
        model: Showtime
      }],
      transaction
    });
    
    if (!reservation) {
      await transaction.rollback();
      return res.status(404).send({ message: 'Reservation not found!' });
    }
    
    // Check if this is the user's reservation
    if (reservation.userId !== userId) {
      await transaction.rollback();
      return res.status(403).send({ message: 'You can only cancel your own reservations!' });
    }
    
    // Check if showtime is in the future (can only cancel future reservations)
    if (new Date(reservation.showtime.startTime) < new Date()) {
      await transaction.rollback();
      return res.status(400).send({ message: 'Cannot cancel reservations for past showtimes!' });
    }
    
    // Get associated seats
    const seats = await reservation.getSeats({ transaction });
    
    // Mark seats as not reserved
    await Promise.all(seats.map(seat => 
      seat.update({ isReserved: false }, { transaction })
    ));
    
    // Update reservation status
    await reservation.update({ status: 'cancelled' }, { transaction });
    
    // Commit transaction
    await transaction.commit();
    
    return res.status(200).send({
      message: 'Reservation cancelled successfully!',
      reservation: {
        id: reservation.id,
        status: 'cancelled'
      }
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).send({ message: error.message });
  }
};

exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email']
        },
        {
          model: Showtime,
          include: [{
            model: Movie,
            attributes: ['id', 'title']
          }]
        }
      ],
      order: [['reservationDate', 'DESC']]
    });
    
    return res.status(200).send(reservations);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

exports.getReservationById = async (req, res) => {
  try {
    const reservationId = req.params.id;
    
    const reservation = await Reservation.findByPk(reservationId, {
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email']
        },
        {
          model: Seat,
          as: 'seats',
          through: { attributes: [] }
        },
        {
          model: Showtime,
          include: [{
            model: Movie,
            attributes: ['id', 'title', 'posterImage']
          }]
        }
      ]
    });
    
    if (!reservation) {
      return res.status(404).send({ message: 'Reservation not found!' });
    }
    
    return res.status(200).send(reservation);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

exports.getReservationReports = async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(0);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    
    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
    }
    
    // Get total revenue by status
    const revenueByStatus = await Reservation.findAll({
      attributes: [
        'status',
        [db.sequelize.fn('SUM', db.sequelize.col('totalAmount')), 'totalRevenue'],
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      where: {
        reservationDate: {
          [Op.between]: [startDate, endDate]
        }
      },
      group: ['status']
    });
    
    // Get top movies by reservations
    const topMovies = await Movie.findAll({
      attributes: [
        'id',
        'title',
        [db.sequelize.fn('COUNT', db.sequelize.col('showtimes->reservations.id')), 'reservationCount'],
        [db.sequelize.fn('SUM', db.sequelize.col('showtimes->reservations.totalAmount')), 'totalRevenue']
      ],
      include: [{
        model: Showtime,
        attributes: [],
        include: [{
          model: Reservation,
          attributes: [],
          where: {
            reservationDate: {
              [Op.between]: [startDate, endDate]
            },
            status: 'confirmed'
          }
        }]
      }],
      group: ['Movie.id', 'Movie.title'],
      order: [[db.sequelize.literal('reservationCount'), 'DESC']],
      limit: 5
    });
    
    // Get theater occupancy rate
    const theaterOccupancy = await Showtime.findAll({
      attributes: [
        'theater',
        [db.sequelize.fn('AVG', 
          db.sequelize.literal('(SELECT COUNT(*) FROM seats WHERE seats.showtimeId = showtimes.id AND seats.isReserved = true) / CAST(showtimes.totalSeats AS FLOAT) * 100')
        ), 'occupancyRate']
      ],
      where: {
        startTime: {
          [Op.between]: [startDate, endDate]
        }
      },
      group: ['theater'],
      order: [['theater', 'ASC']]
    });
    
    return res.status(200).send({
      revenueByStatus,
      topMovies,
      theaterOccupancy
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
}; 