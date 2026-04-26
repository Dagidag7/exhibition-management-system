# Render.com Deployment Guide

## ✅ Your Project is Ready for Deployment!

All configuration files have been created. Follow these steps to deploy:

---

## Step 1: Push to GitHub

```powershell
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Render.com deployment"

# Create repository on GitHub, then:
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

---

## Step 2: Sign Up on Render.com

1. Go to: https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended)
4. Authorize Render to access your repositories

---

## Step 3: Deploy Using Blueprint (Automatic)

### Option A: One-Click Deploy (Easiest)

1. In Render dashboard, click **"New +"** → **"Blueprint"**
2. Connect your GitHub repository
3. Render will detect `render.yaml` and create all services automatically:
   - PostgreSQL database
   - Backend service
   - Frontend service

4. **Set Secret Environment Variables**:
   - Click on `exhibition-backend` service
   - Go to "Environment" tab
   - Add these secrets:
     ```
     SMTP_PASSWORD=[Your Brevo SMTP key]
     STRIPE_SECRET_KEY=[Your Stripe secret key]
     STRIPE_PUBLISHABLE_KEY=[Your Stripe publishable key]
     ```

5. Click **"Apply"** - Render will deploy everything!

---

### Option B: Manual Deploy (More Control)

If blueprint doesn't work, deploy manually:

#### 3.1 Create PostgreSQL Database

1. Click **"New +"** → **"PostgreSQL"**
2. Name: `exhibition-db`
3. Database: `exhibition_db`
4. User: `exhibition_system`
5. Region: Oregon (or closest to you)
6. Plan: **Free**
7. Click **"Create Database"**
8. Wait for database to be ready (2-3 minutes)

#### 3.2 Deploy Backend

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `exhibition-backend`
   - **Region**: Oregon
   - **Branch**: main
   - **Root Directory**: `exhibition-backend`
   - **Runtime**: Java
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/exhibition-backend-1.0-SNAPSHOT-jar-with-dependencies.jar`
   - **Plan**: Free

4. **Environment Variables** (click "Advanced"):
   ```
   DB_URL=[Copy from database Internal Database URL]
   DB_USER=exhibition_system
   DB_PASSWORD=[Copy from database]
   DB_DRIVER=org.postgresql.Driver
   SERVER_PORT=8888
   ALLOWED_ORIGINS=https://exhibition-frontend.onrender.com
   EMAIL_PROVIDER=smtp
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_USER=a923b0001@smtp-brevo.com
   SMTP_PASSWORD=[Your Brevo SMTP key]
   SMTP_FROM=dagimawitkelem129@gmail.com
   SMTP_USE_TLS=true
   STRIPE_SECRET_KEY=[Your Stripe secret key]
   STRIPE_PUBLISHABLE_KEY=[Your Stripe publishable key]
   ADMIN_EMAIL=dagimawitkelem129@gmail.com
   ```

5. Click **"Create Web Service"**
6. Wait for build (5-10 minutes)

#### 3.3 Deploy Frontend

1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `exhibition-frontend`
   - **Region**: Oregon
   - **Branch**: main
   - **Root Directory**: `exhibition-frontend`
   - **Build Command**: `npm install && npm run build -- --configuration production`
   - **Publish Directory**: `dist/exhibition-frontend/browser`

4. Click **"Create Static Site"**
5. Wait for build (3-5 minutes)

---

## Step 4: Initialize Database

Once backend is deployed:

1. Go to your backend service URL: `https://exhibition-backend.onrender.com`
2. The database tables will be created automatically on first run
3. Run the SQL script to add missing columns:
   ```sql
   ALTER TABLE attendee ADD COLUMN IF NOT EXISTS password_changed BOOLEAN DEFAULT true;
   ALTER TABLE attendee ADD COLUMN IF NOT EXISTS is_temporary_password BOOLEAN DEFAULT false;
   ```

---

## Step 5: Update Frontend URL

After frontend deploys, you'll get a URL like: `https://exhibition-frontend.onrender.com`

Update backend CORS:
1. Go to backend service
2. Update `ALLOWED_ORIGINS` environment variable to your frontend URL
3. Save and redeploy

---

## Step 6: Test Your Deployment

1. Visit your frontend URL
2. Test:
   - ✅ Register attendee with Stripe payment
   - ✅ Login as admin (use your admin credentials)
   - ✅ Add exhibitor (should send welcome email)
   - ✅ Forgot password (should send reset email)
   - ✅ Switch to Amharic language

---

## 🎉 Your URLs

After deployment, you'll have:
- **Frontend**: `https://exhibition-frontend.onrender.com`
- **Backend**: `https://exhibition-backend.onrender.com`
- **Database**: Internal (accessed by backend only)

---

## ⚠️ Important Notes

### Free Tier Limitations:
- Services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- 750 hours/month free (enough for one service running 24/7)

### To Upgrade:
- Paid plans start at $7/month per service
- Keeps services always running
- Better performance

### Database Backups:
- Free tier: No automatic backups
- Paid tier: Daily automatic backups
- **Recommendation**: Export your database weekly

---

## 🔧 Troubleshooting

### Backend won't start:
- Check logs in Render dashboard
- Verify all environment variables are set
- Make sure database is running

### Frontend shows errors:
- Check browser console
- Verify backend URL in environment.prod.ts
- Check CORS settings in backend

### Emails not sending:
- Verify SMTP_USER and SMTP_PASSWORD are correct
- Check Brevo dashboard for errors

### Database connection fails:
- Copy exact connection string from database dashboard
- Verify DB_PASSWORD matches database password

---

## 📞 Support

If you need help:
- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- Check service logs in Render dashboard

---

## 🚀 Next Steps After Deployment

1. **Custom Domain** (Optional):
   - Buy domain from Namecheap, GoDaddy, etc.
   - Add custom domain in Render dashboard
   - Update DNS records

2. **Monitoring**:
   - Set up uptime monitoring (UptimeRobot, Pingdom)
   - Monitor email delivery in Brevo dashboard

3. **Backups**:
   - Export database regularly
   - Keep backup of uploaded images

4. **Go Live**:
   - Switch Stripe from test to live keys
   - Update STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY
   - Test payment with real card

---

Good luck with your deployment! 🎉
