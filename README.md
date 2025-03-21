# Movie Reservation System

A backend system for a movie reservation service that allows users to sign up, log in, browse movies, reserve seats for specific showtimes, and manage their reservations. The system features user authentication, movie and showtime management, seat reservation functionality, and reporting on reservations.

## Features

- **User Authentication and Authorization**
  - User registration and login
  - Role-based authorization (admin and regular users)
  - JWT-based authentication

- **Movie Management**
  - CRUD operations for movies
  - Categorization by genre
  - Movie details including title, description, poster image, and duration

- **Showtime Management**
  - Schedule showtimes for movies
  - Manage theaters and seating
  - Prevent scheduling conflicts

- **Seat Reservation**
  - View available seats for a showtime
  - Reserve specific seats
  - Different seat types (standard, premium, VIP)

- **Reservation Management**
  - Create, view, and cancel reservations
  - View upcoming reservations
  - Admin-only reporting on reservations, capacity, and revenue

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd movie-reservation-system
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     PORT=8080
     
     # Database Configuration
     DB_HOST=localhost
     DB_USER=postgres
     DB_PASSWORD=password
     DB_NAME=movie_reservation_db
     
     # JWT Secret
     JWT_SECRET=your-secret-key
     JWT_EXPIRATION=86400 # 24 hours
     ```

4. Create the database in PostgreSQL:
   ```
   createdb movie_reservation_db
   ```
   
   (Or create it using a PostgreSQL client)

5. Start the application:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/signup`: Register a new user
- `POST /api/auth/signin`: Log in a user

### Users

- `GET /api/users/profile`: Get current user profile
- `GET /api/users`: Get all users (admin only)
- `GET /api/users/:id`: Get a user by ID (admin only)
- `PUT /api/users/:id`: Update a user (admin only)
- `DELETE /api/users/:id`: Delete a user (admin only)
- `PUT /api/users/:id/promote`: Promote a user to admin (admin only)

### Movies

- `GET /api/movies/active`: Get all active movies
- `GET /api/movies/:id`: Get a movie by ID
- `GET /api/movies/genre/:genre`: Get movies by genre
- `GET /api/movies`: Get all movies (admin only)
- `POST /api/movies`: Create a new movie (admin only)
- `PUT /api/movies/:id`: Update a movie (admin only)
- `DELETE /api/movies/:id`: Delete a movie (admin only)

### Showtimes

- `GET /api/showtimes/date/:date`: Get showtimes by date
- `GET /api/showtimes/movie/:movieId`: Get showtimes by movie
- `GET /api/showtimes/:id`: Get a showtime by ID
- `GET /api/showtimes/:id/seats`: Get seats for a showtime
- `GET /api/showtimes`: Get all showtimes (admin only)
- `POST /api/showtimes`: Create a new showtime (admin only)
- `PUT /api/showtimes/:id`: Update a showtime (admin only)
- `DELETE /api/showtimes/:id`: Delete a showtime (admin only)

### Reservations

- `POST /api/reservations`: Create a new reservation
- `GET /api/reservations/user`: Get current user's reservations
- `GET /api/reservations/user/upcoming`: Get current user's upcoming reservations
- `PUT /api/reservations/:id/cancel`: Cancel a reservation
- `GET /api/reservations`: Get all reservations (admin only)
- `GET /api/reservations/reports`: Get reservation reports (admin only)
- `GET /api/reservations/:id`: Get a reservation by ID (admin only)

## Default Admin User

On first startup, the system creates a default admin user:

- Username: `admin`
- Password: `admin123`
- Email: `admin@example.com`

## License

This project is licensed under the ISC License. 