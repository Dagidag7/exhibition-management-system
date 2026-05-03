# 🚀 Add Cloudinary Credentials to Render

## Your Credentials (Copy These)

```
Cloud Name: ds2dv0au6
API Key: 853577972477593
API Secret: ypVCMmwaV9g7kTIwhVSJzEu9gA0
```

---

## Step-by-Step Instructions

### Step 1: Go to Render Dashboard
1. Open: **https://dashboard.render.com**
2. Login if needed

### Step 2: Open Backend Service
1. Find and click on: **exhibition-backend-9jxh** (or similar name)
2. You should see your backend service page

### Step 3: Go to Environment Tab
1. On the left sidebar, click: **Environment**
2. You'll see a list of existing environment variables

### Step 4: Add First Variable (Cloud Name)
1. Click the **Add Environment Variable** button
2. In the **Key** field, type: `CLOUDINARY_CLOUD_NAME`
3. In the **Value** field, paste: `ds2dv0au6`
4. Click **Add** or press Enter

### Step 5: Add Second Variable (API Key)
1. Click **Add Environment Variable** again
2. In the **Key** field, type: `CLOUDINARY_API_KEY`
3. In the **Value** field, paste: `853577972477593`
4. Click **Add** or press Enter

### Step 6: Add Third Variable (API Secret)
1. Click **Add Environment Variable** again
2. In the **Key** field, type: `CLOUDINARY_API_SECRET`
3. In the **Value** field, paste: `ypVCMmwaV9g7kTIwhVSJzEu9gA0`
4. Click **Add** or press Enter

### Step 7: Save Changes
1. Scroll to the bottom of the page
2. Click the **Save Changes** button
3. Render will automatically redeploy your backend (takes 2-3 minutes)

---

## Visual Guide

Your environment variables should look like this:

```
DATABASE_URL = postgresql://exhibition_system:...
STRIPE_SECRET_KEY = sk_test_...
SMTP_HOST = smtp.gmail.com
...
CLOUDINARY_CLOUD_NAME = ds2dv0au6          ← NEW
CLOUDINARY_API_KEY = 853577972477593       ← NEW
CLOUDINARY_API_SECRET = ypVCMmwaV9g7kTI... ← NEW
```

---

## What Happens Next

1. ✅ Render detects environment variable changes
2. ✅ Automatically triggers redeployment
3. ✅ Backend rebuilds with Cloudinary integration
4. ⏱️ Wait 2-3 minutes for deployment to complete
5. ✅ Backend will now use Cloudinary for all image uploads

---

## How to Know It's Working

### Check Deployment Status:
1. Stay on the Render dashboard
2. Look for **"Deploy succeeded"** message
3. Or check the **Logs** tab for: `"Cloudinary initialized successfully with cloud: ds2dv0au6"`

### Check Logs:
1. Click **Logs** tab on the left
2. Look for this message:
   ```
   Cloudinary initialized successfully with cloud: ds2dv0au6
   ```
3. If you see this, Cloudinary is working! ✅

---

## After Deployment Completes

### Test Image Upload:
1. Go to: https://exhibition-frontend.onrender.com
2. Login as admin (dagimawitkelem129@gmail.com / Dagikelem123@)
3. Try adding a new sponsor with a logo
4. **Check the image URL** - it should start with:
   ```
   https://res.cloudinary.com/ds2dv0au6/image/upload/...
   ```

### Verify in Cloudinary:
1. Go to: https://console.cloudinary.com/console/media_library
2. Login with your Cloudinary account
3. You should see your uploaded images in folders:
   - `exhibition/logos/`
   - `exhibition/products/`
   - `exhibition/sponsors/`

---

## Troubleshooting

### If deployment fails:
1. Check the **Logs** tab for error messages
2. Look for: `"ERROR: Cloudinary credentials not found"`
3. Make sure you typed the variable names exactly:
   - `CLOUDINARY_CLOUD_NAME` (not cloud_name or CloudName)
   - `CLOUDINARY_API_KEY` (not api_key or ApiKey)
   - `CLOUDINARY_API_SECRET` (not api_secret or ApiSecret)

### If images still don't upload:
1. Check browser console for errors
2. Verify credentials are correct in Render
3. Check Cloudinary dashboard for quota/limits

---

## Summary

**What you need to do:**
1. ✅ Go to Render dashboard
2. ✅ Open exhibition-backend service
3. ✅ Click Environment tab
4. ✅ Add 3 environment variables (see above)
5. ✅ Click Save Changes
6. ⏱️ Wait 2-3 minutes for deployment
7. ✅ Test image upload

**After this:**
- ✅ All new images will be stored in Cloudinary
- ✅ Images will NEVER disappear again
- ✅ Images load faster (CDN)
- ✅ Automatic image optimization

---

**Go ahead and add the credentials to Render now!**

Let me know when you've added them and I'll help you test.
