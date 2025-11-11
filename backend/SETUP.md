# MindBridge Backend - Quick Setup Guide

## ✅ Step 1: Install Dependencies (COMPLETED)
```bash
npm install
```

## ✅ Step 2: Environment Configuration (COMPLETED)
A `.env` file has been created. You need to edit it with your settings:

### Required Changes in `.env`:
1. **Database Configuration**
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_actual_mysql_password
   DB_NAME=mindbridge_db
   DB_PORT=3306
   ```

2. **Security Keys** (Generate random strings)
   ```env
   JWT_SECRET=your_random_secret_key_here
   JWT_REFRESH_SECRET=another_random_secret_key
   SESSION_SECRET=yet_another_random_secret
   ```

3. **Google Maps API** (Optional - for location features)
   ```env
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

## 📋 Step 3: Database Setup

### 3.1 Create Database
Open MySQL and run:
```sql
CREATE DATABASE mindbridge_db;
```

Or use command line:
```bash
mysql -u root -p -e "CREATE DATABASE mindbridge_db;"
```

### 3.2 Import Schema
```bash
mysql -u root -p mindbridge_db < database\schema.sql
```

### 3.3 (Optional) Import Sample Data
```bash
mysql -u root -p mindbridge_db < database\seed.sql
```

**Note:** Before importing seed data, you need to generate password hashes.
Default password for all sample users: `Password123!`

To generate a bcrypt hash in Node.js:
```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('Password123!', 10);
console.log(hash);
```

## 🚀 Step 4: Start the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## ✅ Step 5: Verify Installation

Once server is running, visit:
- Health Check: http://localhost:5000/health
- API Documentation: http://localhost:5000/api/v1

You should see JSON responses confirming the server is running.

## 🧪 Step 6: Test API Endpoints

### Register a new user
```bash
curl -X POST http://localhost:5000/api/v1/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"Password123!\",\"firstName\":\"John\",\"lastName\":\"Doe\",\"role\":\"patient\",\"phone\":\"555-1234\"}"
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"Password123!\"}"
```

## 📝 Common Issues

### Issue: "ECONNREFUSED" or "ER_ACCESS_DENIED_ERROR"
**Solution:** Check your database credentials in `.env` file

### Issue: "Port 5000 already in use"
**Solution:** Change PORT in `.env` file or stop the process using port 5000

### Issue: MySQL not found
**Solution:** Make sure MySQL is installed and running
```bash
# Check if MySQL is running
mysql -u root -p -e "SELECT VERSION();"
```

### Issue: npm scripts not working in PowerShell
**Solution:** Use cmd instead
```bash
cmd /c npm run dev
```

## 🎯 Next Steps

1. ✅ Edit `.env` with your database credentials
2. ✅ Create the database
3. ✅ Import schema.sql
4. ✅ (Optional) Import seed.sql
5. ✅ Start the server
6. ✅ Test the API
7. 🎨 Build the React frontend!

## 📞 Need Help?

Check the main README.md for detailed API documentation and troubleshooting.

---
Good luck building MindBridge! 🧠🌉
