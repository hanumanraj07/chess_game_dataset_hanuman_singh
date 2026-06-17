# Chess Match Analytics - Backend API

This is the Express + MongoDB backend for the Chess Match Analytics platform. It provides RESTful APIs for managing users, matches, players, openings, and aggregated analytics data.

## Features
- **JWT Authentication:** Secure user registration, login, and protected routes.
- **MVC Architecture:** Clean separation of concerns (Routes -> Controllers -> Services -> Models).
- **Advanced Aggregation:** MongoDB pipelines for complex chess statistics and analytics.
- **Validation & Security:** Request validation via `express-validator` and request limiting.

## Prerequisites
- Node.js (v18+)
- MongoDB instance (local or Atlas)

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env` file in the root of the `server` directory and add the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

3. **Start the Server:**
   - **Development mode (with auto-reload):**
     ```bash
     npm run dev
     ```
   - **Production mode:**
     ```bash
     npm start
     ```

## Project Structure
- `/src/models` - Mongoose database schemas.
- `/src/controllers` - HTTP request handlers.
- `/src/services` - Business logic and database queries.
- `/src/routes` - API endpoint definitions.
- `/src/middlewares` - Custom middleware for auth, errors, validation, etc.

## API Documentation
Please refer to the exported Postman Collection in the repository (if provided) for detailed request and response payloads.
