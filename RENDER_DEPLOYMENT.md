# Render Deployment Guide for MindBridge Backend

## Prerequisites
1. Cloud MySQL database (Aiven or Railway)
2. GitHub repository pushed with latest changes
3. Render.com account (free tier available)

## Step-by-Step Deployment

### Step 1: Set Up Cloud Database (if not done)

#### Option A: Aiven (Recommended - Free Tier)
1. Go to https://aiven.io
2. Create account and verify email
3. Click "Create Service" → Select "MySQL"
4. Choose AWS as cloud provider
5. Select region closest to you
6. Choose **Startup-4** (Free tier)
7. Name your service (e.g., `mindbridge-db`)
8. Click "Create Service" (wait 2-3 minutes)
9. **Save these credentials:**
   - Service URI Host: `mysql-xxxxx.aivencloud.com`
   - Port: `xxxxx`
   - User: `avnadmin`
   - Password: `xxxxx`
   - Database: `defaultdb`

#### Option B: Railway.app
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Provision MySQL"
4. Click on MySQL service → "Variables" tab
5. **Save these credentials:**
   - MYSQL_HOST
   - MYSQL_PORT
   - MYSQL_USER
   - MYSQL_PASSWORD
   - MYSQL_DATABASE

### Step 2: Import Database Schema

#### Using MySQL Workbench:
1. Download MySQL Workbench: https://dev.mysql.com/downloads/workbench/
2. Create new connection with your cloud DB credentials
3. Open and execute: `backend/database/schema.sql`
4. Open and execute: `backend/database/seed.sql`

#### Using Command Line:
```bash
# Navigate to backend directory
cd backend/database

# Import schema
mysql -h [DB_HOST] -P [DB_PORT] -u [DB_USER] -p[DB_PASSWORD] [DB_NAME] < schema.sql

# Import seed data
mysql -h [DB_HOST] -P [DB_PORT] -u [DB_USER] -p[DB_PASSWORD] [DB_NAME] < seed.sql
```

### Step 3: Deploy to Render

1. **Go to Render Dashboard**
   - Visit https://render.com
   - Sign up/login with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Click "Connect account" to authorize GitHub
   - Select your repository: `ZoayriaAbedin/MindBridge`

3. **Configure Service**
   - **Name**: `mindbridge-backend`
   - **Region**: Choose closest to you (Oregon recommended for free tier)
   - **Branch**: `main`
   - **Root Directory**: `backend` ⚠️ **IMPORTANT**
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

4. **Add Environment Variables**
   Click "Advanced" → Add these environment variables:

   ```
   NODE_ENV=production
   DB_HOST=your-cloud-db-host
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   DB_NAME=your-db-name
   DB_PORT=3306
   JWT_SECRET=create-a-random-secure-string-here
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   PORT=5002
   ```

   **To generate JWT_SECRET:**
   - Use: https://randomkeygen.com/
   - Copy a "Fort Knox Password" or run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

5. **Create Web Service**
   - Click "Create Web Service"
   - Wait 2-3 minutes for deployment
   - Your backend URL will be: `https://mindbridge-backend.onrender.com`

### Step 4: Connect Frontend to Backend

1. **Update Frontend Environment Variable**
   - Go to your Vercel frontend project
   - Settings → Environment Variables
   - Add or update:
     ```
     REACT_APP_API_URL=https://mindbridge-backend.onrender.com/api/v1
     ```

2. **Update Backend CORS**
   - Go back to Render backend project
   - Environment → Edit `CORS_ORIGIN`
   - Set to your exact frontend URL: `https://your-frontend.vercel.app`
   - Click "Save Changes" (auto-redeploys)

3. **Redeploy Frontend**
   - Go to Vercel frontend project
   - Deployments → Latest deployment → "..." → "Redeploy"

### Step 5: Verify Deployment

1. **Test Backend Health**
   - Visit: `https://mindbridge-backend.onrender.com/health`
   - Should see: `{"status": "ok", "message": "Server is running"}`

2. **Test Frontend Connection**
   - Visit your frontend URL
   - Try to login/register
   - Check browser console for errors

### Step 6: Monitor and Debug

**View Logs:**
- Render Dashboard → Your service → "Logs" tab
- Real-time logs for debugging

**Common Issues:**

1. **CORS Error**
   - Verify `CORS_ORIGIN` matches frontend URL exactly (no trailing slash)
   - Must include protocol: `https://`

2. **Database Connection Failed**
   - Check all DB credentials are correct
   - Verify cloud database is running
   - Check if IP whitelisting is needed (Aiven: allow all IPs for testing)

3. **500 Internal Server Error**
   - Check Render logs for details
   - Verify all environment variables are set
   - Check JWT_SECRET is set

4. **Cold Start Delay (Free Tier)**
   - Render free tier spins down after 15 min inactivity
   - First request after inactivity takes 30-60 seconds
   - Subsequent requests are instant

## Render vs Vercel Comparison

| Feature | Render | Vercel Serverless |
|---------|--------|-------------------|
| **Express Support** | ✅ Native | ⚠️ Requires adaptation |
| **Persistent Process** | ✅ Yes | ❌ No (serverless) |
| **Database Connections** | ✅ Connection pooling | ⚠️ Per-request |
| **Cold Start** | ~30-60s (free tier) | ~2-3s |
| **Timeout** | 90s (free tier) | 10s |
| **File Uploads** | ✅ Can use disk | ❌ Need external storage |
| **Always On** | ❌ Spins down (free) | ✅ Always ready |
| **Best For** | Traditional servers | Stateless functions |

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Set up cloud database
3. ✅ Import schema and seed data
4. ✅ Configure environment variables
5. ✅ Connect frontend to backend
6. ✅ Test all features
7. 🎉 Your app is live!

## Support & Resources

- **Render Docs**: https://render.com/docs
- **Aiven Docs**: https://docs.aiven.io/
- **Railway Docs**: https://docs.railway.app/

## Troubleshooting

If you encounter any issues:
1. Check Render logs first
2. Verify environment variables
3. Test database connection separately
4. Check CORS configuration
5. Verify frontend is using correct backend URL
