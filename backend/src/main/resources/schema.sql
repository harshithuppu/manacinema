-- ============================================================
-- Movie Theater & Ticket Booking System - Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS movie_theater_db;
USE movie_theater_db;

-- ============================================================
-- ROLES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
);

INSERT IGNORE INTO roles (name) VALUES
    ('ROLE_CUSTOMER'),
    ('ROLE_THEATER_OWNER'),
    ('ROLE_ADMIN');

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone_number VARCHAR(15),
    profile_picture VARCHAR(500),
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- USER_ROLES (join table)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- ============================================================
-- MOVIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS movies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    genre VARCHAR(100),
    language VARCHAR(100),
    director VARCHAR(50),
    cast VARCHAR(200),
    release_date DATE,
    duration_minutes INT,
    poster_url VARCHAR(500),
    trailer_url VARCHAR(500),
    rating DOUBLE,
    certification VARCHAR(10),
    status VARCHAR(20) DEFAULT 'COMING_SOON',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- THEATERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS theaters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(200) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(50),
    pincode VARCHAR(10),
    phone_number VARCHAR(15),
    email VARCHAR(100),
    amenities TEXT,
    image_url VARCHAR(500),
    status VARCHAR(30) DEFAULT 'PENDING_APPROVAL',
    owner_id BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- ============================================================
-- SCREENS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS screens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    total_seats INT,
    screen_type VARCHAR(20),
    theater_id BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (theater_id) REFERENCES theaters(id) ON DELETE CASCADE
);

-- ============================================================
-- SEATS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS seats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    row_name VARCHAR(5) NOT NULL,
    seat_number INT NOT NULL,
    seat_type VARCHAR(20),
    screen_id BIGINT,
    FOREIGN KEY (screen_id) REFERENCES screens(id) ON DELETE CASCADE
);

-- ============================================================
-- SHOWS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS shows (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    movie_id BIGINT NOT NULL,
    screen_id BIGINT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    price_regular DOUBLE,
    price_premium DOUBLE,
    price_vip DOUBLE,
    price_recliner DOUBLE,
    status VARCHAR(20) DEFAULT 'SCHEDULED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id),
    FOREIGN KEY (screen_id) REFERENCES screens(id)
);

-- ============================================================
-- BOOKINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_number VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    show_id BIGINT NOT NULL,
    total_amount DOUBLE NOT NULL,
    convenience_fee DOUBLE,
    discount_amount DOUBLE DEFAULT 0,
    final_amount DOUBLE NOT NULL,
    payment_status VARCHAR(20),
    booking_status VARCHAR(20),
    payment_method VARCHAR(50),
    payment_transaction_id VARCHAR(100),
    booking_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    cancellation_time DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (show_id) REFERENCES shows(id)
);

-- ============================================================
-- SHOW_SEATS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS show_seats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    show_id BIGINT NOT NULL,
    seat_id BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'AVAILABLE',
    booking_id BIGINT,
    FOREIGN KEY (show_id) REFERENCES shows(id),
    FOREIGN KEY (seat_id) REFERENCES seats(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Sample Movies
INSERT INTO movies (title, description, genre, language, director, cast, release_date, duration_minutes, certification, status, rating) VALUES
('Kalki 2898-AD', 'A futuristic Indian epic combining mythology and science fiction.', 'Action/Sci-Fi', 'Telugu', 'Nag Ashwin', 'Prabhas, Deepika Padukone, Amitabh Bachchan', '2024-06-27', 180, 'UA', 'NOW_SHOWING', 8.2),
('Stree 2', 'The ghost is back - and this time she is angry. A horror comedy sequel.', 'Horror/Comedy', 'Hindi', 'Amar Kaushik', 'Rajkummar Rao, Shraddha Kapoor', '2024-08-15', 136, 'U', 'NOW_SHOWING', 8.5),
('The Batman', 'When a sadistic serial killer begins murdering key political figures in Gotham...', 'Action/Thriller', 'English', 'Matt Reeves', 'Robert Pattinson, Zoë Kravitz', '2024-12-25', 175, 'UA', 'COMING_SOON', 7.8),
('Pushpa 2', 'The red sandalwood smuggler is back with vengeance and power.', 'Action/Drama', 'Telugu', 'Sukumar', 'Allu Arjun, Rashmika Mandanna', '2024-12-05', 190, 'A', 'NOW_SHOWING', 8.7);
