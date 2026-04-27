# 🚀 Deployment Checklist - Exhibition Management System

## ✅ Step-by-Step Deployment Guide

### 1. **Add Missing Environment Variables in Render Dashboard**

Go to your backend service on Render: `https://dashboard.render.com/web/exhibition-backend-9jxh`

Click **Environment** tab and add these variables:

```
SMTP_PASSWORD = [Get from exhibition-backend/.env file]
STRIPE_SECRET_KEY = [Get from exhibition-backend/.env file]
```

**Important**: After adding these, click **Save Changes** - this will trigger an automatic redeploy.

---

### 2. **Wait for Automatic Redeployment**

Both services will redeploy automatically:
- ✅ **Frontend**: Fixed build command will now use production configuration
- ✅ **Backend**: Will have all required environment variables

Monitor deployment at:
- Frontend: https://dashboard.render.com/static/exhibition-frontend
- Backend: https://dashboard.render.com/web/exhibition-backend-9jxh

---

### 3. **Verify Backend is Running**

Once backend deployment completes, test the health endpoint:

```bash
curl https://exhibition-backend-9jxh.onrender.com/
```

Expected response:
```json
{
  "status": "OK",
  "message": "Exhibition Management System API",
  "version": "1.0.0",
  "timestamp": "2026-04-27T..."
}
```

---

### 4. **Check Database Connection**

Test if backend can connect to PostgreSQL:

```bash
curl https://exhibition-backend-9jxh.onrender.com/database/tables
```

Expected response: List of database tables (should be empty if not created yet)

---

### 5. **Create Database Tables**

Go to Render Dashboard → Databases → `exhibition-db` → **Connect** tab

Copy the **PSQL Command** and run it in your terminal:

```bash
psql postgresql://exhibition_system:...@dpg-...oregon-postgres.render.com/exhibition_db
```

Once connected, run the schema creation script:

```sql
-- Copy and paste the entire content of database-schema.sql
-- Or run: \i /path/to/database-schema.sql
```

Verify tables were created:
```sql
\dt
```

You should see 8 tables:
- attendee
- exhibitor
- product
- conference
- speaker
- sponsor
- partner
- floor

Exit psql:
```sql
\q
```

---

### 6. **Test Admin Login**

1. Go to: https://exhibition-frontend.onrender.com
2. Click **Admin Login**
3. Enter credentials:
   - Email: `dagimawitkelem129@gmail.com`
   - Password: `Dagikelem123@`
4. You should see the admin dashboard with statistics (all zeros initially)

---

### 7. **Verify Image Loading**

Test if images are being served correctly:

```bash
curl -I https://exhibition-backend-9jxh.onrender.com/images/background.png
```

Expected: `HTTP/2 200` status code

---

### 8. **Test API Endpoints**

Test statistics endpoint:
```bash
curl https://exhibition-backend-9jxh.onrender.com/attendees/count
```

Expected: `{"count": 0}` (or actual count if data exists)

---

## 🔧 Troubleshooting

### Frontend shows "Cannot connect to backend"
- Check if backend URL in `environment.prod.ts` is correct
- Verify CORS is configured with frontend URL
- Check browser console for specific errors

### Backend shows database connection errors
- Verify all DB_* environment variables are set correctly
- Check database is running on Render
- Ensure database tables are created

### Images not loading
- Verify images folder exists in Docker container
- Check backend logs for file serving errors
- Test image URLs directly in browser

### Admin login fails
- Verify ADMIN_EMAIL and ADMIN_PASSWORD environment variables
- Check backend logs for authentication errors

---

## 📊 Current Configuration

### URLs
- **Frontend**: https://exhibition-frontend.onrender.com
- **Backend**: https://exhibition-backend-9jxh.onrender.com
- **Database**: PostgreSQL on Render (exhibition-db)

### Admin Credentials
- **Email**: dagimawitkelem129@gmail.com
- **Password**: Dagikelem123@

### Services Configured
- ✅ PostgreSQL Database
- ✅ Brevo SMTP (Email)
- ✅ Stripe Payments (Test Mode)
- ✅ File Uploads
- ✅ CORS

---

## 🎯 What Changed in Latest Deployment

1. **Fixed Frontend Build Command**: Changed from `npm run build --configuration=production` to `npm run build -- --configuration=production` (proper Angular CLI syntax)

2. **Added ALLOWED_ORIGINS**: Backend now explicitly allows frontend URL for CORS

3. **Environment Variables**: Added placeholders for SMTP_PASSWORD and STRIPE_SECRET_KEY (must be added manually in Render dashboard)

4. **Database Configuration**: Backend properly constructs JDBC URL from DB_HOST, DB_PORT, DB_NAME environment variables

---

## ✨ Next Steps After Deployment

1. **Create test data**: Add sample exhibitors, products, conferences
2. **Test all features**: Registration, login, file uploads, payments
3. **Monitor logs**: Check for any errors or warnings
4. **Set up monitoring**: Use Render's monitoring tools
5. **Configure custom domain** (optional): Add your own domain name

---

## 📞 Support

If you encounter issues:
1. Check Render logs for both services
2. Verify all environment variables are set
3. Ensure database tables are created
4. Test API endpoints individually

**Deployment Status**: Ready to deploy after adding environment variables ✅
