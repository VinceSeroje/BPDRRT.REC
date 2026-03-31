# Supabase Setup Guide for Cross-Device Data Sync

## Why Supabase?
The current system uses localStorage, which only stores data on the user's browser. This means:
- Data is lost when you clear browser data
- Data is NOT accessible from other devices
- Members can't login from different devices

Supabase provides a FREE PostgreSQL database that allows:
- ✅ Data sync across ALL devices
- ✅ Members can login from any device
- ✅ Admin data is persistent
- ✅ Real-time data updates

## Setup Steps

### Step 1: Create a Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub or Email
4. Create a new organization (free tier)

### Step 2: Create a New Project
1. Click "New Project"
2. Name it: "mcgi-drrt-attendance"
3. Set a strong database password (save this!)
4. Choose a region close to you
5. Click "Create new project" (wait ~2 minutes)

### Step 3: Run the Database Schema
1. In your Supabase dashboard, go to "SQL Editor"
2. Click "New Query"
3. Copy the entire contents of `SUPABASE_SCHEMA.sql`
4. Paste and click "Run"
5. You should see "Success. No rows returned"

### Step 4: Get Your API Keys
1. Go to "Settings" → "API"
2. Copy the following:
   - **Project URL** (under "Project URL")
   - **anon public key** (under "Project API keys")

### Step 5: Configure Your App
1. Open `supabase-config.js`
2. Replace the placeholder values:
```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### Step 6: Deploy
Deploy your app to Vercel, Netlify, or any hosting service.

## Free Tier Limits
Supabase free tier includes:
- 500 MB database storage
- 1 GB file storage
- 50,000 monthly active users
- Unlimited API requests

This is MORE than enough for the MCGI DRRT-RACS system!

## Security Notes
For production, consider:
1. Enable Row Level Security (RLS) with proper policies
2. Use authentication for admin/member logins
3. Don't expose sensitive data in the anon key

## Troubleshooting
- **"Failed to fetch"**: Check your Supabase URL and key
- **"Permission denied"**: Run the SQL schema again
- **Data not syncing**: Check browser console for errors

## Alternative: Use JSONBin.io
If Supabase is too complex, you can use JSONBin.io (simpler):
1. Go to https://jsonbin.io
2. Create a free account
3. Create a bin and get the API key
4. Update the app to use JSONBin API

---
Need help? Contact the developer or check Supabase documentation.