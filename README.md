# MindBridge - Mental Health Platform

A comprehensive mental health platform connecting patients with mental health professionals.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MySQL (via XAMPP or standalone)
- npm or yarn

### Running the Full Application

#### Option 1: Run Both Servers Together (Recommended)

```bash
# From the root directory
npm start
```

This will start both:
- **Backend API** on `http://localhost:5001`
- **Frontend App** on `http://localhost:3000`

#### Option 2: Run Servers Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Development Mode with Auto-Reload

```bash
# Run both in development mode with auto-reload
npm run dev
```

Or separately:

**Backend with nodemon:**
```bash
cd backend
npm run dev
```

**Frontend with hot reload:**
```bash
cd frontend
npm start
```

## 📋 Initial Setup

### 1. Install Dependencies

```bash
# Install all dependencies (root, backend, and frontend)
npm run install:all
```

Or manually:
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

Make sure MySQL is running (via XAMPP or standalone).

The database has already been set up, but if you need to reset it:

```bash
# Using XAMPP MySQL
/Applications/XAMPP/xamppfiles/bin/mysql -u root -e "CREATE DATABASE IF NOT EXISTS mindbridge_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

/Applications/XAMPP/xamppfiles/bin/mysql -u root mindbridge_db < backend/database/schema.sql

/Applications/XAMPP/xamppfiles/bin/mysql -u root mindbridge_db < backend/database/seed.sql
```

### 3. Environment Configuration

Backend environment variables are already configured in `backend/.env`:
- `PORT=5001`
- `DB_HOST=localhost`
- `DB_SOCKET=/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock`
- Database name: `mindbridge_db`

Frontend environment variables in `frontend/.env`:
- `REACT_APP_API_URL=http://localhost:5001/api/v1`

## 🌐 Accessing the Application

Once both servers are running:

- **Frontend Application**: http://localhost:3000
- **Backend API Health**: http://localhost:5001/health
- **API Documentation**: http://localhost:5001/api/v1

## 📦 Available Scripts

### Root Directory

- `npm start` - Run both backend and frontend servers
- `npm run dev` - Run both in development mode with auto-reload
- `npm run install:all` - Install all dependencies
- `npm run start:backend` - Run only backend
- `npm run start:frontend` - Run only frontend
- `npm run dev:backend` - Run backend in dev mode
- `npm run dev:frontend` - Run frontend in dev mode
- `npm run build` - Build frontend for production

### Backend (`backend/`)

- `npm start` - Start the backend server
- `npm run dev` - Start with nodemon (auto-reload)
- `npm test` - Run tests

### Frontend (`frontend/`)

- `npm start` - Start the React development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 🔧 Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Check what's using port 3000 (frontend)
lsof -i :3000

# Check what's using port 5001 (backend)
lsof -i :5001

# Kill a process by PID
kill -9 <PID>
```

### MySQL Connection Issues

1. Make sure MySQL is running:
   - Open XAMPP Control Panel
   - Start MySQL service

2. Verify database exists:
```bash
/Applications/XAMPP/xamppfiles/bin/mysql -u root -e "SHOW DATABASES LIKE 'mindbridge_db';"
```

3. Check socket path in `backend/.env` matches your MySQL installation

### Cannot Connect to Backend

1. Verify backend is running on port 5001
2. Check `frontend/.env` has correct API URL: `http://localhost:5001/api/v1`
3. Test backend health: `curl http://localhost:5001/health`

## 📁 Project Structure

```
MindBridge/
├── backend/           # Express.js API server
│   ├── config/        # Configuration files
│   ├── controllers/   # Route controllers
│   ├── database/      # SQL schemas and seeds
│   ├── middleware/    # Express middleware
│   ├── routes/        # API routes
│   ├── uploads/       # File uploads
│   ├── .env          # Environment variables
│   └── server.js     # Entry point
├── frontend/          # React application
│   ├── public/        # Static files
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React context
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── App.js       # Main app component
│   └── .env          # Environment variables
└── package.json      # Root package file

```

## 🎯 Features

- User authentication (patients, doctors, admins)
- Doctor search and recommendations
- Appointment booking and management
- Medical history tracking
- Prescription management
- Support groups
- Admin dashboard for user and appointment management

## 📄 License

MIT License - see LICENSE file for details
