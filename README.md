# ♟️ Chess Match Analytics API

A scalable backend API for chess match analytics built using Node.js, Express.js, MongoDB, and Mongoose. The project provides powerful CRUD operations, filtering, pagination, search, authentication, analytics, and chess data management features.

---

## 📌 Project Information

- **Project Name:** Chess Match Analytics API
- **Repository:** https://github.com/hanumanraj07/chess_game_dataset_hanuman_singh
- **Backend Stack:** Node.js, Express.js, MongoDB, Mongoose
- **Package Manager:** npm
- **Deployment Target:** Render
- **Architecture:** MVC (Model View Controller)

---

# Live Links

- **Backend Health Check:** https://chess-dataset.onrender.com/health
- **Postman Documentation:** https://documenter.getpostman.com/view/50839390/2sBXwnuCeK
- **Dataset:** https://drive.google.com/file/d/1zbYfcDC6hN6nPyIagaEig8kIombqKVAy/view

---

# 🚀 Features

## Core Features

- RESTful API Architecture
- MongoDB Database Integration
- Mongoose Schema Modeling
- CRUD Operations
- Pagination
- Filtering
- Sorting
- Search Functionality
- JWT Authentication
- Protected Routes
- Global Error Handling
- Middleware Architecture
- Aggregation Pipelines
- Scalable Folder Structure
- Environment Variable Configuration
- API Testing with Postman

---

# 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | Runtime Environment |
| Express.js | Backend Framework |
| MongoDB | NoSQL Database |
| Mongoose | ODM for MongoDB |
| JWT | Authentication |
| bcryptjs | Password Hashing |
| dotenv | Environment Variables |
| cors | Cross-Origin Requests |
| morgan | Request Logging |
| helmet | Security Middleware |

---

# 📂 Project Structure

```text
chess_game_dataset_hanuman_singh/
|-- README.md
`-- server/
    |-- .env
    |-- .env.example
    |-- .gitignore
    |-- package-lock.json
    |-- package.json
    `-- src/
        |-- app.js
        |-- server.js
        |-- config/
        |   |-- db.js
        |   `-- env.js
        |-- controllers/
        |   |-- admin.controller.js
        |   |-- analytics.controller.js
        |   |-- auth.controller.js
        |   |-- match.controller.js
        |   |-- middleware.controller.js
        |   |-- opening.controller.js
        |   |-- player.controller.js
        |   |-- search.controller.js
        |   |-- stats.controller.js
        |   `-- system.controller.js
        |-- middlewares/
        |   |-- auth.middleware.js
        |   |-- error.middleware.js
        |   |-- logger.middleware.js
        |   |-- rateLimiter.middleware.js
        |   `-- validate.middleware.js
        |-- models/
        |   |-- Match.js
        |   |-- Opening.js
        |   |-- Player.js
        |   `-- User.js
        |-- routes/
        |   |-- admin.routes.js
        |   |-- analytics.routes.js
        |   |-- auth.routes.js
        |   |-- filter.routes.js
        |   |-- match.routes.js
        |   |-- middleware.routes.js
        |   |-- opening.routes.js
        |   |-- player.routes.js
        |   |-- protected.routes.js
        |   |-- search.routes.js
        |   |-- stats.routes.js
        |   `-- system.routes.js
        |-- scripts/
        |   |-- find-data.js
        |   `-- import-data.js
        |-- services/
        |   |-- admin.service.js
        |   |-- analytics.service.js
        |   |-- auth.service.js
        |   |-- match.service.js
        |   |-- opening.service.js
        |   |-- player.service.js
        |   |-- search.service.js
        |   |-- stats.service.js
        |   `-- system.service.js
        `-- utils/
            |-- apiResponse.js
            |-- asyncHandler.js
            |-- cast.js
            |-- pagination.js
            `-- query.js
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/hanumanraj07/chess_game_dataset_hanuman_singh.git
```

---

## 2️⃣ Navigate to Server Folder

```bash
cd server
```

---

## 3️⃣ Install Dependencies

```bash
npm install
```

---

## 4️⃣ Configure Environment Variables

Create a `.env` file inside the `server` folder.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret_key

JWT_REFRESH_SECRET=your_jwt_refresh_secret_key

NODE_ENV=development
```

---

## 5️⃣ Run Development Server

```bash
npm run dev
```

---

# 🔐 Authentication System

The project uses JWT-based authentication.

## Authentication Features

- User Registration
- User Login
- Password Hashing
- JWT Token Generation
- Protected Routes
- Authorization Middleware

---

# 📊 Database Design

## Main Collections

### Matches Collection

Stores:
- Match details
- Player information
- Ratings
- Openings
- Moves
- Results
- Time controls

### Players Collection

Stores:
- Player statistics
- Ratings
- Match history
- Win/Loss records

### Openings Collection

Stores:
- ECO codes
- Opening names
- Opening analytics
- Win rates

### Users Collection

Stores:
- Authentication data
- User roles
- Profile information

---

# 📡 API Features

## Match APIs

- Fetch all matches
- Fetch single match
- Create match
- Update match
- Delete match
- Match analytics
- Match filtering

---

## Player APIs

- Fetch player details
- Player statistics
- Rating history
- Match history

---

## Search APIs

- Search matches
- Search players
- Search openings
- Fuzzy search
- Autocomplete

---

## Analytics APIs

- Victory distribution
- Opening success rate
- Match statistics
- Time control analytics
- Rating analysis

---

# 🔍 Advanced Functionalities

## Filtering

Supports:
- Rated matches
- Blitz matches
- Bullet matches
- Draw matches
- Checkmate matches

---

## Pagination

Example:

```http
GET /api/v1/matches?page=1&limit=10
```

---

## Sorting

Example:

```http
GET /api/v1/matches?sort=-createdAt
```

---

## Search

Example:

```http
GET /api/v1/search/matches?q=mate
```

---

# 🧩 Middleware System

## Implemented Middlewares

- Authentication Middleware
- Error Handling Middleware
- Logger Middleware
- Request Validation Middleware
- CORS Middleware

---

# 📈 Aggregation Pipelines

MongoDB Aggregation Framework is used for:

- Victory distribution
- Top openings
- Player growth analytics
- Time control analytics
- Match statistics

---

# 🧪 API Testing

API testing is done using Postman.

## Postman Collection Includes

- Authentication APIs
- Match APIs
- Player APIs
- Search APIs
- Analytics APIs

---

# 🛡️ Security Features

- JWT Authentication
- Password Hashing
- Protected Routes
- Environment Variable Protection
- Secure Middleware Setup

---

# 🌐 Deployment

Backend deployment target:

- Render

---

# 📖 Environment Variables

| Variable | Description |
|---|---|
| PORT | Server Port |
| MONGODB_URI | MongoDB Connection String |
| JWT_SECRET | JWT Secret Key |
| JWT_REFRESH_SECRET | JWT Refresh Token Secret |
| NODE_ENV | Environment Mode |

---

# 🧠 Learning Objectives

This project demonstrates understanding of:

- Backend Development
- REST API Design
- MongoDB Data Modeling
- Authentication & Authorization
- MVC Architecture
- Aggregation Pipelines
- Error Handling
- Scalable Backend Structure

---

# 📌 Future Improvements

- Redis Caching
- WebSocket Integration
- Real-time Match Updates
- Swagger Documentation
- Advanced Search Engine
- AI-based Match Analysis

---

# 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

## Steps

1. Fork the repository
2. Create a new branch
3. Commit changes
4. Push changes
5. Create Pull Request

---

# 📄 License

This project is developed for educational and academic purposes.

---

# 👨‍💻 Author

### Hanuman Singh

- GitHub: https://github.com/hanumanraj07

---

# ⭐ Project Status

🚧 Backend Development In Progress
