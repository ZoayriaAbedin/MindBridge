# 🚀 Quick Start Guide

## Three Easy Ways to Run MindBridge

### Method 1: Using npm (Recommended)
```bash
# From the MindBridge root directory
npm start
```
This runs both backend and frontend together using concurrently.

### Method 2: Using the Shell Script
```bash
# From the MindBridge root directory
./start.sh
```
This starts both servers and shows you live status.

### Method 3: Manual (Two Terminals)

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

---

## 🌐 Access the Application

Once running, open your browser:
- **App**: http://localhost:3000
- **API**: http://localhost:5001/api/v1

---

## 🛑 Stop the Servers

- **Method 1 & 2**: Press `Ctrl+C`
- **Method 3**: Press `Ctrl+C` in each terminal

---

## ⚡ Development Mode (Auto-reload)

For development with automatic reloading:
```bash
npm run dev
```

---

## 🔧 First Time Setup

Only need to do this once:

```bash
# Install all dependencies
npm run install:all
```

Database is already set up! ✅

---

## 📝 Troubleshooting

### Port 3000 or 5001 already in use?

```bash
# Find what's using the port
lsof -i :3000  # or :5001

# Kill the process (replace <PID> with actual number)
kill -9 <PID>
```

### MySQL not connecting?

Make sure XAMPP MySQL is running:
1. Open XAMPP Control Panel
2. Click "Start" next to MySQL

---

## 📚 Need More Help?

Check the main `README.md` for detailed documentation.
