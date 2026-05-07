# LET Reviewer PH — Deployment Guide

## Step 1: Create Your Accounts (Do This First)

### 1.1 Supabase (Database + Auth) — FREE
1. Go to https://supabase.com → Create Account
2. Create New Project (pick any name, choose Singapore region for Philippines)
3. Save these from Settings → API:
   - **Project URL** (looks like `https://xxx.supabase.co`)
   - **Anon Public Key**
   - **Service Role Key** (keep secret!)

### 1.2 GitHub — FREE
1. Go to https://github.com → Create Account
2. Create New Repository → name it `let-reviewer`
3. Copy the repository URL

### 1.3 Vercel (Hosting) — FREE
1. Go to https://vercel.com → Sign Up with GitHub
2. You'll connect your repo later

### 1.4 PayMongo (Philippine Payments)
1. Go to https://paymongo.com → Apply for account
2. Complete business verification (takes 1-3 days)
3. Once approved, go to Dashboard → Developers → API Keys
4. Copy your **Secret Key** and **Public Key**
5. Add webhook URL after deployment: `https://your-domain.vercel.app/api/subscription/webhook`

### 1.5 Google AdSense (Ads Revenue)
1. Deploy your site first (Step 4)
2. Go to https://adsense.google.com → Apply with your live URL
3. Wait for approval (takes a few days to weeks)
4. Once approved, copy your **Publisher ID** (ca-pub-XXXXXXXXXXXXXXXX)
5. Create ad units → copy their **Slot IDs**

---

## Step 2: Set Up the Database

1. Go to your Supabase project → SQL Editor
2. Copy the ENTIRE contents of `supabase/migrations/001_schema.sql`
3. Paste into SQL Editor → Click **Run**
4. You should see "Success. No rows returned."

### Enable Google OAuth in Supabase
1. Supabase → Authentication → Providers
2. Enable **Google**
3. Go to https://console.cloud.google.com → Create Project
4. APIs & Services → Credentials → Create OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URI: `https://xxx.supabase.co/auth/v1/callback`
5. Copy **Client ID** and **Client Secret** → paste into Supabase

---

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```
   cp .env.example .env.local
   ```

2. Fill in `.env.local` with your actual values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   PAYMONGO_SECRET_KEY=sk_live_xxxxx
   PAYMONGO_PUBLIC_KEY=pk_live_xxxxx
   NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxx
   NEXT_PUBLIC_ADSENSE_SLOT_BANNER=xxxxxxxxxx
   NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app
   ```

---

## Step 4: Push to GitHub and Deploy

### Push to GitHub
Open Terminal / Command Prompt in the `let-reviewer` folder:

```bash
git init
git add .
git commit -m "Initial commit: LET Reviewer PH"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/let-reviewer.git
git push -u origin main
```

### Deploy to Vercel
1. Go to https://vercel.com → New Project
2. Import your `let-reviewer` GitHub repo
3. Framework preset: **Next.js** (auto-detected)
4. Add all environment variables from `.env.local`
5. Click **Deploy**

Your site will be live at: `https://let-reviewer.vercel.app`

---

## Step 5: Make Yourself Admin

After creating your account on the live site:

1. Go to Supabase → Table Editor → `profiles`
2. Find your user row
3. Set `is_admin` to `true`

Now you can access `/admin` to manage questions.

---

## Step 6: Add More Questions (Important!)

The seed has 10 sample questions. You need **500+ questions minimum** to launch.

### Option A: Admin Panel (one by one)
Go to `/admin/questions` → Add Question

### Option B: CSV Bulk Import via Supabase
1. Create a CSV with columns: `subject, topic, difficulty, question_text, choices (JSON), correct_answer, explanation, exam_type`
2. Supabase → Table Editor → questions → Import CSV

### Option C: SQL Insert (fastest)
Add multiple questions at once in the SQL Editor using the pattern in `001_schema.sql`

---

## Step 7: Set Up PayMongo Webhook

1. Log in to PayMongo Dashboard → Developers → Webhooks
2. Add webhook URL: `https://your-domain.vercel.app/api/subscription/webhook`
3. Select event: `payment.paid`
4. Copy the webhook secret → add to Vercel environment variables as `PAYMONGO_WEBHOOK_SECRET`

---

## Step 8: Register Service Worker (PWA)

Add this to your homepage or layout to register the service worker:

The service worker (`/public/sw.js`) auto-registers when users install the app.

For proper icon generation, create PNG icons:
- `/public/icons/icon-192.png` (192×192px)
- `/public/icons/icon-512.png` (512×512px)

Use your logo/brand colors. Free tool: https://realfavicongenerator.net

---

## Step 9: Custom Domain (Optional)

1. Buy a domain (e.g., `letreviewer.ph`) from Namecheap, GoDaddy, etc.
2. Vercel → Project → Settings → Domains → Add domain
3. Update DNS records as instructed by Vercel

---

## Monthly Revenue Potential

### Ad Revenue (Free Users)
- AdSense pays ₱10–₱40 per 1,000 page views in Philippines
- 1,000 active users → ~50,000 page views/month → ₱500–₱2,000/month

### Subscription Revenue (Premium Users)
- Monthly plan: ₱199/month
- Yearly plan: ₱999/year
- 100 premium users: ₱19,900–₱99,900/month

### Growth Path
- Month 1-3: Build question bank, SEO content, social media
- Month 3-6: Target 1,000 users, first revenue
- Month 6-12: Target 5,000 users, ₱50,000+/month
- Year 2: Expand to Civil Service, Nursing, etc.

---

## Tech Stack Summary

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 15 | SEO + PWA + React |
| Styling | Tailwind CSS | Rapid professional UI |
| Database | Supabase (PostgreSQL) | Free tier, auth included |
| Hosting | Vercel | Free tier, auto-deploys |
| Ads | Google AdSense | Easiest PH ad monetization |
| Payments | PayMongo | GCash + Maya + Card |
| Offline | Service Worker | Works without internet |

---

## Need Help?

Common issues:
- **"relation does not exist"** → Run the SQL migration in Supabase
- **Login not working** → Check Supabase URL and anon key in Vercel env vars
- **Payments not activating** → Set up PayMongo webhook correctly
- **Build errors on Vercel** → Check all environment variables are set
