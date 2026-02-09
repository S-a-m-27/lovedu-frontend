# Vercel Deployment Guide

Step-by-step instructions to deploy the Next.js frontend on Vercel.

## Prerequisites

- GitHub account (or GitLab/Bitbucket)
- Vercel account (free tier works)
- Your project pushed to a Git repository

## Step 1: Prepare Your Repository

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Verify your `package.json` has build scripts:**
   - ✅ `"build": "next build"` (already present)
   - ✅ `"start": "next start"` (already present)

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel:**
   - Visit [https://vercel.com](https://vercel.com)
   - Sign up/Login with GitHub

2. **Import Your Project:**
   - Click **"Add New..."** → **"Project"**
   - Import your GitHub repository
   - Select the repository containing your frontend

3. **Configure Project Settings:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `frontend` (if your repo has both frontend/backend, otherwise leave blank)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

4. **Set Environment Variables:**
   Click **"Environment Variables"** and add:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   PAYPAL_CLIENT_ID=your_paypal_client_id (optional)
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret (optional)
   ```

   **Important:**
   - Replace `your_supabase_url_here` with your actual Supabase project URL
   - Replace `your_supabase_anon_key_here` with your Supabase anon key
   - Replace `your-backend-url.railway.app` with your Railway backend URL (after backend deployment)
   - For now, you can use `http://localhost:8000` for testing, then update after backend is deployed

5. **Deploy:**
   - Click **"Deploy"**
   - Wait for build to complete (2-5 minutes)
   - Your app will be live at `https://your-project.vercel.app`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

4. **Deploy:**
   ```bash
   vercel
   ```
   - Follow the prompts:
     - Set up and deploy? **Yes**
     - Which scope? (select your account)
     - Link to existing project? **No** (first time)
     - Project name? (enter a name or press Enter for default)
     - Directory? **./** (current directory)
     - Override settings? **No**

5. **Set Environment Variables:**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add NEXT_PUBLIC_API_URL
   ```
   Enter values when prompted.

6. **Redeploy with environment variables:**
   ```bash
   vercel --prod
   ```

## Step 3: Configure Custom Domain (Optional - GoDaddy)

If you want to use your GoDaddy domain:

1. **In Vercel Dashboard:**
   - Go to your project → **Settings** → **Domains**
   - Add your domain: `yourdomain.com`
   - Follow DNS configuration instructions

2. **In GoDaddy DNS Settings:**
   - Add a **CNAME** record:
     - **Type:** CNAME
     - **Name:** `@` or `www`
     - **Value:** `cname.vercel-dns.com` (Vercel will provide exact value)
   - Or add **A** records if Vercel provides IP addresses

3. **Wait for DNS Propagation:**
   - Can take 24-48 hours (usually much faster)
   - Vercel will automatically provision SSL certificate

## Step 4: Configure Supabase Auth for Production

After deployment, update Supabase to allow your production domain:

1. **Go to Supabase Dashboard:**
   - Navigate to **Authentication** → **URL Configuration**

2. **Update Site URL:**
   ```
   https://your-project.vercel.app
   ```
   (Or your custom domain if configured)

3. **Add Redirect URLs:**
   ```
   https://your-project.vercel.app/**
   https://your-project.vercel.app/auth/callback
   https://your-project.vercel.app/login
   https://your-project.vercel.app/signup
   ```
   (Add your custom domain URLs if using one)

## Step 5: Update Backend CORS (After Backend Deployment)

Once your backend is deployed on Railway:

1. **Update Backend Environment Variable:**
   In Railway, add/update:
   ```
   CORS_ORIGINS=https://your-project.vercel.app,https://yourdomain.com
   ```

2. **Update Frontend Environment Variable:**
   In Vercel, update:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```

3. **Redeploy Frontend:**
   - Vercel will auto-redeploy on next git push
   - Or manually trigger redeploy in Vercel dashboard

## Troubleshooting

### Build Fails

1. **Check build logs in Vercel dashboard**
2. **Common issues:**
   - Missing environment variables → Add them in Vercel dashboard
   - TypeScript errors → Fix locally, push again
   - Missing dependencies → Check `package.json`

### Environment Variables Not Working

- **Restart deployment** after adding env vars
- **Check variable names** (must start with `NEXT_PUBLIC_` for client-side)
- **Verify no typos** in variable values

### API Connection Issues

- **Check `NEXT_PUBLIC_API_URL`** is set correctly
- **Verify backend CORS** allows your Vercel domain
- **Check backend is running** and accessible

### Authentication Not Working

- **Verify Supabase URLs** in environment variables
- **Check Supabase redirect URLs** include your Vercel domain
- **Ensure Site URL** in Supabase matches your production domain

## Post-Deployment Checklist

- [ ] Frontend deployed successfully
- [ ] Environment variables set correctly
- [ ] Supabase Auth configured with production URLs
- [ ] Backend CORS updated (after backend deployment)
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Test login/signup flow
- [ ] Test API connectivity
- [ ] Test all major features

## Next Steps

After frontend is deployed:
1. Deploy backend on Railway (see `RAILWAY_DEPLOYMENT.md`)
2. Update `NEXT_PUBLIC_API_URL` in Vercel
3. Update `CORS_ORIGINS` in Railway backend
4. Test full integration

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Status: https://vercel-status.com
- Next.js Deployment: https://nextjs.org/docs/deployment
