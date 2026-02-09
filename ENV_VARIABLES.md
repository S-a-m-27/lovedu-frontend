# Environment Variables Reference

This file documents all required and optional environment variables for the frontend application.

## Required Environment Variables

### Supabase Configuration

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**How to get:**
1. Go to Supabase Dashboard → Settings → API
2. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Backend API URL

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**For production:**
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

**Note:** Must start with `NEXT_PUBLIC_` to be accessible in the browser.

## Optional Environment Variables

### PayPal Configuration (for subscription features)

```env
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
```

**Note:** `PAYPAL_CLIENT_SECRET` is server-side only and should NOT be exposed to the client. If you need PayPal integration, handle it through your backend API.

## Setting Environment Variables

### Local Development

Create a `.env.local` file in the `frontend` directory:

```bash
cp .env.example .env.local
# Then edit .env.local with your actual values
```

### Vercel Deployment

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable with its value
3. Select environment: **Production**, **Preview**, and/or **Development**
4. Redeploy after adding variables

## Important Notes

- ⚠️ **Never commit** `.env.local` to version control (already in `.gitignore`)
- ⚠️ Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- ⚠️ Never put sensitive secrets in `NEXT_PUBLIC_` variables
- ✅ Vercel automatically injects environment variables during build
- ✅ Changes to environment variables require a redeploy
