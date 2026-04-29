# 🌟 Cloudinary Setup Guide

## Status: Waiting for Your Credentials

I've prepared all the code changes. Now you need to:
1. Sign up for Cloudinary
2. Get your credentials
3. Add them to Render
4. Deploy

---

## Step 1: Sign Up for Cloudinary (5 minutes)

### 1.1 Create Account
1. Go to: **https://cloudinary.com/users/register_free**
2. Sign up with your email (or use Google/GitHub)
3. Verify your email if required

### 1.2 Get Your Credentials
After signup, you'll see the **Dashboard**. Look for the **Account Details** section:

```
Cloud name:  dxyz123abc
API Key:     123456789012345
API Secret:  abcdefghijklmnopqrstuvwxyz123
```

**Copy these 3 values** - you'll need them in the next step.

---

## Step 2: Add Credentials to Render (3 minutes)

### 2.1 Go to Render Backend Service
1. Go to: https://dashboard.render.com
2. Click on your **exhibition-backend** service
3. Click **Environment** tab on the left

### 2.2 Add Environment Variables
Click **Add Environment Variable** and add these 3 variables:

**Variable 1:**
```
Key:   CLOUDINARY_CLOUD_NAME
Value: [paste your cloud name here]
```

**Variable 2:**
```
Key:   CLOUDINARY_API_KEY
Value: [paste your API key here]
```

**Variable 3:**
```
Key:   CLOUDINARY_API_SECRET
Value: [paste your API secret here]
```

### 2.3 Save Changes
Click **Save Changes** button at the bottom.

**Important:** Don't deploy yet! We need to push the code first.

---

## Step 3: Deploy Code Changes (I'll Do This)

Once you provide your credentials, I will:
1. Commit the code changes
2. Push to GitHub
3. Render will automatically deploy
4. Test the image upload

---

## What Changed in the Code

### Files Modified:
1. ✅ `exhibition-backend/pom.xml` - Added Cloudinary dependency
2. ✅ `exhibition-backend/src/main/java/com/exhibition/service/CloudinaryFileServiceImpl.java` - NEW file
3. ✅ `exhibition-backend/src/main/java/com/exhibition/MainVerticle.java` - Use Cloudinary instead of local storage

### How It Works Now:

**Before (Local Storage):**
```
User uploads image
  ↓
Saved to /images/logos/abc123.jpg (local disk)
  ↓
URL: https://exhibition-backend-9jxh.onrender.com/images/logos/abc123.jpg
  ↓
❌ Render restarts → File deleted → Broken image
```

**After (Cloudinary):**
```
User uploads image
  ↓
Uploaded to Cloudinary cloud storage
  ↓
URL: https://res.cloudinary.com/your_cloud/image/upload/v123/exhibition/logos/abc123.jpg
  ↓
✅ Render restarts → File still in cloud → Image works forever
```

---

## Step 4: Test After Deployment (5 minutes)

### 4.1 Upload a Test Image
1. Go to: https://exhibition-frontend.onrender.com
2. Login as admin
3. Add a new sponsor with logo
4. **Check the image URL** - should start with `https://res.cloudinary.com/`

### 4.2 Verify Persistence
1. Wait 5 minutes
2. Refresh the page
3. Image should still load ✅

### 4.3 Check Cloudinary Dashboard
1. Go to: https://console.cloudinary.com/console/media_library
2. You should see your uploaded images organized in folders:
   - `exhibition/logos/`
   - `exhibition/products/`
   - `exhibition/sponsors/`
   - `exhibition/landing/`
   - `exhibition/misc/`

---

## Image URL Format

### Old Format (Local Storage):
```
https://exhibition-backend-9jxh.onrender.com/images/logos/abc123.jpg
```

### New Format (Cloudinary):
```
https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/exhibition/logos/abc123.jpg
```

**Benefits:**
- ✅ Images never disappear
- ✅ Faster loading (CDN)
- ✅ Automatic optimization
- ✅ Automatic format conversion (WebP for modern browsers)
- ✅ Can resize/transform images on-the-fly

---

## Cloudinary Features You Get (Free Tier)

### Storage & Bandwidth:
- 25 GB storage
- 25 GB bandwidth per month
- Unlimited transformations

### Image Optimization:
- Automatic format selection (WebP, AVIF)
- Automatic quality optimization
- Lazy loading support
- Responsive images

### Organization:
- Folder structure (logos, products, sponsors, etc.)
- Search and filter
- Bulk operations
- Image metadata

### Transformations (Optional):
You can resize images on-the-fly by modifying the URL:
```
Original:
https://res.cloudinary.com/demo/image/upload/exhibition/logos/abc123.jpg

Thumbnail (200x200):
https://res.cloudinary.com/demo/image/upload/w_200,h_200,c_fill/exhibition/logos/abc123.jpg

Optimized:
https://res.cloudinary.com/demo/image/upload/q_auto,f_auto/exhibition/logos/abc123.jpg
```

---

## Migration of Existing Images (Optional)

If you have important images currently in the database with old URLs, we can migrate them:

### Option A: Re-upload Manually
1. Download images from old URLs (if still available)
2. Re-upload through admin panel
3. Old images will be replaced with Cloudinary URLs

### Option B: Automated Migration (I can help)
1. I'll create a migration script
2. Script downloads all images from database URLs
3. Uploads to Cloudinary
4. Updates database with new URLs

**Note:** Since Render restarts daily, old images are likely already gone. New uploads will use Cloudinary automatically.

---

## Troubleshooting

### Error: "Cloudinary credentials not configured"
**Solution:** Make sure you added all 3 environment variables to Render:
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

### Error: "Invalid credentials"
**Solution:** Double-check your credentials in Cloudinary dashboard. Make sure you copied them correctly (no extra spaces).

### Images still not loading
**Solution:** 
1. Check browser console for errors
2. Verify the image URL starts with `https://res.cloudinary.com/`
3. Check Cloudinary dashboard to see if images were uploaded

### Upload fails
**Solution:**
1. Check file size (max 10MB)
2. Check file type (only images allowed)
3. Check Cloudinary dashboard for quota limits

---

## Next Steps

**Please provide your Cloudinary credentials:**

1. **Cloud Name:** _________________
2. **API Key:** _________________
3. **API Secret:** _________________

Once you provide these, I will:
1. ✅ Verify the credentials format
2. ✅ Commit and push the code
3. ✅ Guide you through adding them to Render
4. ✅ Test the deployment
5. ✅ Verify images persist after restart

---

## Cost Estimate

### Free Tier (Current):
- **Cost:** $0/month
- **Storage:** 25 GB
- **Bandwidth:** 25 GB/month
- **Transformations:** Unlimited

### If You Exceed Free Tier:
- **Storage:** $0.18/GB/month (only if you exceed 25 GB)
- **Bandwidth:** $0.08/GB (only if you exceed 25 GB/month)

**Estimated usage for your exhibition system:**
- Average image: 500 KB
- 1000 images = 500 MB storage
- 10,000 views/month = 5 GB bandwidth
- **Total cost:** $0 (well within free tier)

---

**Date:** April 29, 2026
**Status:** ⏳ Waiting for Cloudinary Credentials
