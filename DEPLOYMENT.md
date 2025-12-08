# Budgify Deployment Guide

This guide will help you deploy Budgify so you and your partner can access it from anywhere.

## 🏗️ Deployment Architecture

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────┐
│   Frontend      │       │    Backend      │       │  Database   │
│   (Vercel)      │──────▶│ (Railway/Render)│──────▶│   SQLite    │
│   Next.js App   │ HTTPS │  Express API    │       │ Persistent  │
└─────────────────┘       └─────────────────┘       └─────────────┘
```

**Why this architecture?**
- **Frontend on Vercel**: Perfect for Next.js, automatic deployments, free tier
- **Backend on Railway/Render**: Persistent storage for SQLite database
- **Vercel serverless functions DON'T work** because SQLite needs persistent file storage

## 📋 Pre-Deployment Checklist

### 1. Generate a Secure JWT Secret

Run this command to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output - you'll need it for both platforms!

### 2. Choose Your Backend Host

We recommend:
- **Railway** (recommended): Easy setup, good free tier, persistent storage
- **Render**: Good alternative, free tier available
- **Fly.io**: More control, good for production

## 🚂 Option A: Deploy Backend to Railway

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"

### Step 2: Configure Railway

1. Select your `budgify` repository
2. Railway will auto-detect the Node.js backend
3. Add a `railway.json` file to specify the backend directory:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && npm install && npm run build"
  },
  "deploy": {
    "startCommand": "cd backend && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Step 3: Set Environment Variables in Railway

Go to your Railway project → Variables → Add these:

```
PORT=3000
JWT_SECRET=<your-generated-secret-from-step-1>
CORS_ORIGIN=https://your-app-name.vercel.app
```

**Important:** You'll update `CORS_ORIGIN` after deploying the frontend!

### Step 4: Deploy & Get URL

1. Railway will automatically deploy
2. Click "Settings" → "Generate Domain"
3. Copy your Railway URL (e.g., `https://budgify-backend-production.up.railway.app`)
4. **Save this URL** - you'll need it for the frontend!

## 🚀 Option B: Deploy Backend to Render

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New" → "Web Service"

### Step 2: Configure Render

1. Connect your GitHub repository
2. Configure:
   - **Name**: `budgify-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### Step 3: Set Environment Variables in Render

Add these in the "Environment" section:

```
PORT=3000
JWT_SECRET=<your-generated-secret-from-checklist>
CORS_ORIGIN=https://your-app-name.vercel.app
```

### Step 4: Deploy & Get URL

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Copy your Render URL (e.g., `https://budgify-backend.onrender.com`)
4. **Save this URL** - you'll need it for the frontend!

## ☁️ Deploy Frontend to Vercel

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New" → "Project"

### Step 2: Import Project

1. Select your `budgify` repository
2. Vercel will auto-detect Next.js
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

### Step 3: Set Environment Variables

Add this in "Environment Variables":

```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
```

Replace `your-backend-url.railway.app` with your actual Railway/Render URL from above!

### Step 4: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes
3. Get your Vercel URL (e.g., `https://budgify.vercel.app`)

### Step 5: Update Backend CORS

**IMPORTANT:** Go back to Railway/Render and update `CORS_ORIGIN`:

```
CORS_ORIGIN=https://budgify.vercel.app
```

Replace with your actual Vercel URL! Redeploy the backend after this change.

## 🎉 First Time Setup

### Partner 1:
1. Visit your Vercel URL (e.g., `https://budgify.vercel.app`)
2. Click "Sign Up"
3. Create account with your email
4. Set your budget limit
5. Start tracking!

### Partner 2:
1. Visit the same Vercel URL
2. Click "Sign Up"
3. Create account with a **different email**
4. Set your own budget limit
5. Track independently!

## 🔒 Security Best Practices

### Change Default JWT Secret

**CRITICAL:** Never use the default JWT secret in production!

1. Generate a new secret (see Pre-Deployment Checklist)
2. Update in Railway/Render environment variables
3. Redeploy backend

### Verify CORS Configuration

Make sure `CORS_ORIGIN` matches your Vercel URL exactly:
- ✅ `https://budgify.vercel.app`
- ❌ `https://budgify.vercel.app/` (no trailing slash)
- ❌ `http://budgify.vercel.app` (use https)

## 🐛 Troubleshooting

### "Network Error" or CORS Issues

**Problem:** Frontend can't connect to backend

**Solutions:**
1. Check `NEXT_PUBLIC_API_URL` in Vercel environment variables
2. Verify `CORS_ORIGIN` in Railway/Render matches your Vercel URL
3. Make sure backend is running (check Railway/Render logs)
4. Try accessing `https://your-backend-url/api/health` directly

### "Invalid Token" Errors

**Problem:** JWT tokens not working

**Solutions:**
1. Make sure `JWT_SECRET` is the same on backend
2. Clear browser local storage and re-login
3. Check backend logs for authentication errors

### Database Issues

**Problem:** Data not persisting or getting lost

**Solutions:**
1. **Verify persistent storage** on Railway/Render
2. Check backend logs for database errors
3. Make sure `backend/data` directory is being created

### Backend Won't Deploy

**Problem:** Railway/Render deployment fails

**Solutions:**
1. Check build logs for errors
2. Verify `package.json` has correct scripts:
   - `"build": "tsc"`
   - `"start": "node dist/index.js"`
3. Make sure `tsconfig.json` is in backend directory

## 📊 Monitoring

### Check Backend Health

Visit: `https://your-backend-url/api/health`

Should return:
```json
{
  "status": "ok",
  "message": "Budgify API is running"
}
```

### View Logs

- **Railway**: Dashboard → Deployments → View Logs
- **Render**: Dashboard → Logs tab
- **Vercel**: Dashboard → Deployments → View Function Logs

## 💰 Cost Estimate

### Free Tier (Recommended for Personal Use)

- **Vercel**: Free tier includes:
  - Unlimited deployments
  - 100GB bandwidth/month
  - Automatic HTTPS

- **Railway**: Free tier includes:
  - $5 credit/month
  - Enough for 24/7 backend hosting
  - 1GB persistent storage

- **Render**: Free tier includes:
  - 750 hours/month
  - Sleeps after 15min inactivity
  - 500MB storage

**Total: FREE** for both partners!

### If You Outgrow Free Tier

- Railway: $5-10/month for upgraded plan
- Render: $7/month for always-on service
- Vercel: Free tier is usually enough

## 🔄 Future Updates

### Deploy New Changes

**Frontend (Vercel):**
- Push to GitHub → Automatic deployment

**Backend (Railway/Render):**
- Push to GitHub → Automatic deployment
- Or manually trigger redeploy in dashboard

### Database Migrations

If you need to change the database schema:
1. Update `backend/src/db/database.ts`
2. Deploy backend
3. Railway/Render will automatically run migrations on restart

## 🆘 Need Help?

Common issues:
1. Frontend deployed but shows errors → Check Vercel function logs
2. Can't connect to backend → Verify CORS_ORIGIN and API URL
3. Data not saving → Check Railway/Render has persistent storage enabled
4. Authentication issues → Verify JWT_SECRET is set correctly

## 📚 Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
