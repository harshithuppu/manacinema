# 🎬 MANA CINEMA — Movie Theater & Ticket Booking System
### Full-Stack Java Spring Boot & React Application

A modern, high-performance cinema theater management and movie ticket booking platform branded **MANA CINEMA**, designed with a luxury **brown & white** theme and tailored for **Telangana** theaters (Hyderabad, Warangal, Karimnagar, Nizamabad, Khammam, Nalgonda, Adilabad).

Featuring secure server-side **TMDB movie data integration**, interactive real-time seat reservation, digital e-tickets with QR codes, multi-role security (Customer, Theater Owner, Admin), and comprehensive REST APIs.

---

## 📁 Single Unified Project Structure

All project source code, configurations, database scripts, and launchers reside inside this single folder:
```
movie-theater-system/
│
├── start_all.bat               # 🚀 1-Click launcher (starts backend & frontend)
├── start_backend.bat           # Starts Spring Boot backend
├── start_frontend.bat          # Starts React frontend
├── README.md                   # Complete documentation & guide
│
├── backend/                    # Spring Boot 3.2.4 Application
│   ├── pom.xml                 # Maven dependencies & plugins
│   └── src/main/
│       ├── java/com/movietheater/
│       │   ├── config/         # Security, JWT, CORS, seed data
│       │   ├── controller/     # Movie, Theater, Show, Booking, Auth REST endpoints
│       │   ├── dto/            # Request/Response data transfer models & TMDB DTOs
│       │   ├── model/          # JPA Entities (Movie, Theater, Screen, Show, Seat, Booking)
│       │   ├── repository/     # Spring Data JPA repositories
│       │   ├── security/       # JWT Auth Filters, Token Provider, UserDetails
│       │   └── service/        # Business logic & TMDB proxy integration
│       └── resources/
│           ├── application.properties  # Database, JWT, TMDB API configuration
│           └── schema.sql              # MySQL DDL schema
│
└── frontend/                   # React.js Application
    ├── package.json            # Node dependencies
    ├── public/                 # HTML shell, favicons, metadata
    └── src/
        ├── api/                # Axios API client with JWT interceptor
        ├── components/         # Navbar (City Selector), Footer, MovieCard, ProtectedRoute
        ├── context/            # AuthContext (state, JWT storage, login/logout)
        ├── pages/
        │   ├── HomePage.js         # Blockbuster banner, Now Showing/Coming Soon, Language filters
        │   ├── MovieDetailsPage.js # Showtimes by theater & date, trailer preview
        │   ├── SeatSelectionPage.js# Interactive cinema seat map (Regular, Premium, VIP, Recliner)
        │   ├── MyBookingsPage.js   # Digital E-Ticket passes with QR codes
        │   ├── TheatersPage.js     # Telangana theaters by city & amenities
        │   ├── LoginPage.js        # Authentication with 1-Click Demo accounts
        │   ├── RegisterPage.js     # User registration
        │   ├── AdminDashboard.js   # Platform administration
        │   ├── AdminMoviesPage.js  # TMDB proxy search/import & showtime scheduler
        │   └── OwnerDashboard.js   # Theater owner console (screens & auditoriums)
        ├── App.js              # Routing & global layout
        └── index.css           # Brown & White luxury design system & responsive styling
```

---

## 🛠️ Technology Stack

### Backend
- **Java**: 17+ (fully tested on JDK 17 through JDK 26)
- **Framework**: Spring Boot 3.2.4
- **Web**: Spring MVC (RESTful architecture)
- **Data & ORM**: Spring Data JPA & Hibernate
- **Database**: MySQL 8.0 (`movie_theater_db`)
- **Security**: Spring Security 6 with JWT (JSON Web Tokens) Authentication
- **External Integration**: TMDB API (The Movie Database) via server-side proxy

### Frontend
- **Framework**: React.js
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with automatic JWT bearer interceptor
- **Styling**: Vanilla CSS Design System with CSS variables (warm brown `#3D2314`, cream `#F5EBE1`, and gold `#D4A373` accents)
- **State Management**: React Context & Hooks

---

## 👥 Pre-configured Demo Accounts

| Role | Username | Password | Features & Permissions |
| :--- | :--- | :--- | :--- |
| **🔑 Admin** | `admin` | `admin123` | Master control: Search & import TMDB movies, edit metadata, schedule showtimes across Telangana theaters, approve theaters, oversee platform. |
| **🎬 Theater Owner** | `owner` | `owner123` | Theater dashboard: Register halls, manage auditoriums (IMAX Laser, Dolby Atmos, VIP), monitor revenue. |
| **👤 Customer** | `customer` | `customer123` | Browse catalog by city & language, select seats in real-time, generate instant QR tickets, view booking history. |

> 💡 **Quick 1-Click Login**: The Sign In page (`/login`) includes 1-click quick-fill buttons for all roles.

---

## 🚀 Quick Start Guide

### Step 1: Start MySQL Database
Ensure MySQL Server is running locally on port `3306`:
- Database Name: `movie_theater_db`
- Username: `root`
- Password: `root`

*(The Spring Boot application automatically creates the database, schema, and seed data upon startup!)*

### Step 2: 1-Click Launch
Double-click:
```bash
start_all.bat
```
This automatically launches both the Spring Boot backend and React frontend in separate windows.

**Or start manually:**

#### Backend:
```bash
cd backend
mvn spring-boot:run
```
- API Base URL: `http://localhost:8080/api`

#### Frontend:
```bash
cd frontend
npm start
```
- Web Application: `http://localhost:3000`

---

## 🔑 TMDB Integration Configuration

TMDB API keys are **never** sent to the client frontend. The Spring Boot backend securely proxies all requests:
- In `backend/src/main/resources/application.properties`:
  ```properties
  tmdb.api.key=${TMDB_API_KEY:your_tmdb_api_key_here}
  tmdb.api.base-url=https://api.themoviedb.org/3
  ```
- **Smart Fallback**: If an API key is not configured or network rate-limits occur, the backend automatically provides authentic curated metadata for top Indian blockbusters (*Kalki 2898 AD, Pushpa 2, Devara, RRR, Salaar, Hanu-Man, Guntur Kaaram, Stree 2*) so search, import, and show scheduling work out-of-the-box.

---

## 🏙️ Supported Telangana Cities
- **Hyderabad** (Capital & major multiplex hub)
- **Warangal**
- **Karimnagar**
- **Nizamabad**
- **Khammam**
- **Nalgonda**
- **Adilabad**
