# We Believe Academics — Technical Deployment Document

**Document purpose:** Step-by-step instructions for a Code agent or engineer to deploy
the `web/` Next.js site from this repository to production on Cloudflare Pages,
with Vercel as the documented alternative.

**Prepared for:** Automated or assisted deployment execution
**Repository:** https://github.com/ddavidduncan/webelieveacademics
**Production URL:** https://webelieveacademics.com
**Site root in repo:** `web/`
**Last commit deployed:** f19d028

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Repository Structure](#2-repository-structure)
3. [Environment Variables](#3-environment-variables)
4. [Pre-Deployment Checklist](#4-pre-deployment-checklist)
5. [Local Build Verification](#5-local-build-verification)
6. [Deploy: Cloudflare Pages (Primary)](#6-deploy-cloudflare-pages-primary)
7. [Deploy: Vercel (Alternative)](#7-deploy-vercel-alternative)
8. [DNS & Domain Configuration](#8-dns--domain-configuration)
9. [Post-Deployment Verification](#9-post-deployment-verification)
10. [Rollback Procedure](#10-rollback-procedure)
11. [Ongoing Deployment Workflow](#11-ongoing-deployment-workflow)

---

## 1. Architecture Overview

```
GitHub repo (main branch)
        │
        │  git push triggers automatic build
        ▼
Cloudflare Pages (CI/CD)
  ├─ Build command: npm run build  (runs inside web/)
  ├─ Output directory: web/out     (static HTML/CSS/JS export)
  └─ Global CDN → webelieveacademics.com
        │
        │  Contact form POSTs to
        ▼
Formspree (https://formspree.io)
  └─ Delivers submissions to hello@webelieveacademics.com
```

**Stack:**
- Framework: Next.js 14.2.3 (App Router, static export mode)
- Styling: Tailwind CSS 3.4.4
- Language: TypeScript 5
- Fonts: Google Fonts via `next/font` (Playfair Display + Inter), self-hosted by Next.js
- Form handling: Formspree (external SaaS, free tier)
- Hosting: Cloudflare Pages (static CDN, no server-side runtime required)

**Important:** `next.config.js` sets `output: 'export'` — this generates a fully static
site in `web/out/`. No Node.js server, no edge functions, no serverless. Pure static CDN.

---

## 2. Repository Structure

```
webelieveacademics/          ← repo root
├── web/                     ← Next.js marketing site (DEPLOY THIS)
│   ├── app/                 ← App Router pages
│   │   ├── layout.tsx       ← Root layout (navbar + footer + global meta)
│   │   ├── globals.css      ← Tailwind base + custom design tokens
│   │   ├── page.tsx         ← Home page
│   │   ├── about/page.tsx
│   │   ├── programs/page.tsx
│   │   ├── how-it-works/page.tsx
│   │   └── contact/page.tsx
│   ├── components/          ← All React components
│   ├── lib/utils.ts         ← cn() class merger utility
│   ├── public/logo.svg      ← Brand logo (served at /logo.svg)
│   ├── .env.local.example   ← Environment variable template
│   ├── next.config.js       ← output: 'export', images: unoptimized
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
├── src/                     ← Fastify API backend (NOT deployed here)
├── db/                      ← Database migrations (NOT deployed here)
├── ops/                     ← Nginx/systemd configs (NOT deployed here)
└── assets/                  ← Legacy static site assets (NOT deployed here)
```

**Only the `web/` directory is deployed.** The `src/` backend is a separate
service deployed independently via Docker/systemd.

---

## 3. Environment Variables

### Required for production

| Variable | Description | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_FORMSPREE_ID` | Formspree form ID for the contact form | See §3.1 below |

### How to set in Cloudflare Pages

Cloudflare Dashboard → Pages → `webelieveacademics` project →
Settings → Environment Variables → Add variable:

```
Name:   NEXT_PUBLIC_FORMSPREE_ID
Value:  [your formspree form id]
```

Set for both **Production** and **Preview** environments.

### §3.1 — Formspree setup (do this first)

The contact form at `/contact` submits to Formspree. Without this, form
submissions will fail silently in production.

**Steps (one-time):**

1. Go to https://formspree.io
2. Create a free account using `hello@webelieveacademics.com`
3. Click **+ New Form**
4. Name: `WBA Consultation Requests`
5. Email notifications to: `hello@webelieveacademics.com`
6. Copy the **Form ID** shown — it looks like `xpznkgvb` (8 random chars)
7. Save it — you will paste it as the env var value in §6 step 8

**Free tier limits:** 50 submissions/month. Upgrade to Formspree Lite ($10/mo)
if volume exceeds this.

---

## 4. Pre-Deployment Checklist

Run through each item before executing the deployment:

- [ ] GitHub account has push access to `ddavidduncan/webelieveacademics`
- [ ] Cloudflare account exists and `webelieveacademics.com` DNS is already managed there
- [ ] Formspree account created and Form ID obtained (see §3.1)
- [ ] Node.js 18+ is installed locally (`node -v` → must be `v18.x` or higher)
- [ ] Local build passes without errors (see §5)
- [ ] No uncommitted changes in `web/` (`git status` is clean)

---

## 5. Local Build Verification

Run these commands before deploying to catch any build errors locally.
All commands run from the **repo root**.

```bash
# Step 1 — Navigate to the web app
cd /path/to/webelieveacademics/web

# Step 2 — Install dependencies (clean install)
npm ci

# Step 3 — Type-check (catch TS errors without building)
npm run typecheck

# Step 4 — Full production build
npm run build
```

**Expected output from Step 4:**

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (7/7)
✓ Finalizing page optimization

Route (app)                   Size     First Load JS
┌ ○ /                         ...
├ ○ /about
├ ○ /contact
├ ○ /how-it-works
└ ○ /programs

○  (Static) prerendered as static content
```

**Output directory:** `web/out/`
Verify it exists and contains HTML files:
```bash
ls web/out/
# Expected: index.html  about/  programs/  how-it-works/  contact/  _next/  logo.svg
```

**If build fails:** Check the error message. Common causes:
- TypeScript errors → fix the reported file/line
- Missing dependency → run `npm install [package]` and commit `package.json`
- Import path errors → verify `@/` paths resolve from `web/`

---

## 6. Deploy: Cloudflare Pages (Primary)

### §6.1 — First-time project setup (run once)

> If the Cloudflare Pages project already exists, skip to §6.2.

**Prerequisites:** Cloudflare CLI installed and authenticated, OR use the dashboard.

#### Option A — Cloudflare Dashboard (recommended for first deploy)

1. Log in to https://dash.cloudflare.com
2. Select your account → **Workers & Pages** in the left sidebar
3. Click **Create application** → **Pages** → **Connect to Git**
4. Authorize Cloudflare to access your GitHub account (one-time)
5. Select repository: `ddavidduncan/webelieveacademics`
6. Click **Begin setup**
7. Configure the build:

   | Field | Value |
   |---|---|
   | Project name | `webelieveacademics` |
   | Production branch | `main` |
   | **Root directory** | `web` |
   | Framework preset | `Next.js (Static HTML Export)` |
   | **Build command** | `npm run build` |
   | **Build output directory** | `out` |
   | Node.js version | `18` |

   > **Critical:** Root directory must be `web` (not `/web`, not blank). This tells
   > Cloudflare Pages to `cd web` before running the build command.

8. **Environment variables** (click "Add variable" for each):

   | Variable name | Value |
   |---|---|
   | `NEXT_PUBLIC_FORMSPREE_ID` | `[your formspree form id from §3.1]` |
   | `NODE_VERSION` | `18` |

9. Click **Save and Deploy**
10. Wait 2–4 minutes for the first build to complete
11. Cloudflare assigns a preview URL: `https://webelieveacademics.pages.dev`
12. Verify all 5 pages load correctly at that URL before pointing the real domain

#### Option B — Cloudflare CLI (wrangler)

```bash
# Install wrangler globally if not present
npm install -g wrangler

# Authenticate
wrangler login

# Build locally first
cd web && npm ci && npm run build && cd ..

# Deploy the static output directly
wrangler pages deploy web/out \
  --project-name webelieveacademics \
  --branch main
```

### §6.2 — Subsequent deploys (automatic via git push)

Once the project is set up, every push to `main` triggers an automatic rebuild:

```bash
# Make code changes in web/
git add web/
git commit -m "your commit message"
git push origin main
# Cloudflare Pages detects the push → builds → deploys automatically
```

**Monitor the build:** Cloudflare Dashboard → Pages → `webelieveacademics` →
Deployments tab → click the latest deployment to see build logs in real time.

**Typical build time:** 60–90 seconds for this project.

### §6.3 — Manual deploy without git push (emergency)

```bash
cd web
npm ci
npm run build
wrangler pages deploy out --project-name webelieveacademics
```

---

## 7. Deploy: Vercel (Alternative)

Use this if Cloudflare Pages is unavailable or if SSR/edge functions are needed later.

### First-time setup

#### Option A — Vercel Dashboard

1. Go to https://vercel.com → **Add New Project**
2. Import from GitHub → select `ddavidduncan/webelieveacademics`
3. Configure:

   | Field | Value |
   |---|---|
   | **Root Directory** | `web` |
   | Framework Preset | Next.js (auto-detected) |
   | Build Command | `npm run build` (auto) |
   | Output Directory | `out` (auto from next.config.js) |
   | Install Command | `npm ci` |

4. Environment variables → Add: `NEXT_PUBLIC_FORMSPREE_ID` = your form ID
5. Click **Deploy**

#### Option B — Vercel CLI

```bash
npm install -g vercel

cd web
vercel login
vercel --prod
# Follow prompts:
#   Set up and deploy? Y
#   Which scope? [your account]
#   Link to existing project? N (first time) / Y (subsequent)
#   Project name: webelieveacademics
#   In which directory is your code located? ./  (you're already in web/)
```

### Subsequent Vercel deploys

Vercel auto-deploys on every push to `main` once connected. Preview deployments
are created automatically for every PR/branch push.

---

## 8. DNS & Domain Configuration

> **Note:** DNS for `webelieveacademics.com` is already managed on Cloudflare.
> Reference: `CLOUDFLARE_CUTOVER_STEPS.txt` in the repo root for the original DNS setup.

### Pointing the domain to Cloudflare Pages

1. Cloudflare Dashboard → Pages → `webelieveacademics` → **Custom domains**
2. Click **Set up a custom domain**
3. Enter: `webelieveacademics.com`
4. Click **Continue**
5. Since DNS is already on Cloudflare, it auto-creates the CNAME record:
   ```
   CNAME  webelieveacademics.com  →  webelieveacademics.pages.dev
   ```
6. Click **Activate domain**
7. SSL certificate is provisioned automatically (usually < 5 minutes)

**Also add the www subdomain:**

Repeat steps 2–6 for `www.webelieveacademics.com`.

Then add a redirect rule: Cloudflare Dashboard → your domain → Rules →
Redirect Rules → Create rule:
- When incoming URL hostname equals `www.webelieveacademics.com`
- Then redirect to `https://webelieveacademics.com` (301 permanent)

### DNS records that should exist after setup

| Type | Name | Content | Proxy |
|---|---|---|---|
| CNAME | `webelieveacademics.com` | `webelieveacademics.pages.dev` | Proxied (orange cloud) |
| CNAME | `www` | `webelieveacademics.pages.dev` | Proxied (orange cloud) |

**Important:** Keep proxy status **Proxied** (orange cloud), not DNS-only.
This routes traffic through Cloudflare's CDN for caching, SSL, and DDoS protection.

---

## 9. Post-Deployment Verification

Run all of these checks after every production deployment.

### 9.1 — Page load checks

Open each URL in an incognito browser window and verify:

| URL | Expected | Check |
|---|---|---|
| `https://webelieveacademics.com` | Home page loads, logo visible, hero text correct | |
| `https://webelieveacademics.com/about` | About page loads with brand copy | |
| `https://webelieveacademics.com/programs` | 4 program cards visible | |
| `https://webelieveacademics.com/how-it-works` | 5 numbered steps visible | |
| `https://webelieveacademics.com/contact` | Form loads, all fields present | |
| `https://www.webelieveacademics.com` | Redirects to non-www (301) | |

### 9.2 — Contact form test

1. Go to `/contact`
2. Fill all required fields with test data:
   - Name: `Test User`
   - Email: `test@example.com`
   - Goals: `Testing the contact form submission`
3. Click submit
4. Expected: green success message appears
5. Verify the submission appears in your Formspree dashboard
6. Verify a notification email arrives at `hello@webelieveacademics.com`

### 9.3 — Mobile responsiveness

Open Chrome DevTools → Toggle device toolbar → test at:
- 375px width (iPhone SE)
- 768px width (iPad)
- 1280px width (desktop)

Check at each breakpoint:
- [ ] Navbar hamburger appears at mobile, collapses at desktop
- [ ] All text readable, no horizontal scroll
- [ ] CTA buttons full-width on mobile
- [ ] Cards stack vertically on mobile

### 9.4 — Logo display

- [ ] Logo appears in navbar (36×36px, rounded)
- [ ] Logo appears prominently in the hero section right panel (desktop)
- [ ] Logo in footer (40×40px)
- [ ] No broken image icons anywhere (if logo.svg fails to load)

### 9.5 — SSL and performance

```bash
# Check SSL certificate
curl -I https://webelieveacademics.com
# Expected: HTTP/2 200, server: cloudflare, strict-transport-security header present

# Check redirect from www
curl -I https://www.webelieveacademics.com
# Expected: HTTP/1.1 301 and Location: https://webelieveacademics.com
```

### 9.6 — Core Web Vitals (optional but recommended)

Run a Lighthouse report in Chrome DevTools → Lighthouse → Mobile:
- Performance: target > 85
- Accessibility: target > 90
- SEO: target > 90

---

## 10. Rollback Procedure

If a deployment introduces a regression:

### Rollback via Cloudflare Pages Dashboard (fastest)

1. Cloudflare Dashboard → Pages → `webelieveacademics` → Deployments
2. Find the last known good deployment in the list
3. Click the `···` menu next to it → **Rollback to this deployment**
4. Confirm — the rollback completes in < 30 seconds, no rebuild required

### Rollback via git revert

```bash
# Identify the bad commit
git log --oneline -5

# Revert it (creates a new commit, safe for shared history)
git revert [bad-commit-hash] --no-edit

# Push — triggers automatic redeploy
git push origin main
```

### Rollback via git reset (use only if the bad commit was never public)

```bash
# Reset to the last good commit
git reset --hard [last-good-commit-hash]
git push origin main --force-with-lease
```

---

## 11. Ongoing Deployment Workflow

### Standard feature deployment

```bash
# 1. Make changes in web/
# 2. Verify locally
cd web && npm run dev
# Test at http://localhost:3000

# 3. Build check
npm run build
# Confirm no errors, web/out/ generated

# 4. Commit and push
cd ..
git add web/
git commit -m "describe your change"
git push origin main
# Cloudflare Pages auto-deploys in ~90 seconds
```

### Adding a new page

1. Create `web/app/[page-name]/page.tsx`
2. Add the route to the nav links array in `web/components/layout/Navbar.tsx`
3. Add the route to the footer links in `web/components/layout/Footer.tsx`
4. Follow the existing page structure (eyebrow → H1 → body → FooterCTA)
5. Commit and push

### Updating environment variables

1. Cloudflare Dashboard → Pages → `webelieveacademics` → Settings → Environment Variables
2. Edit the variable value
3. **Trigger a new deployment** — env var changes do NOT auto-redeploy:
   - Either push a trivial commit, or
   - Cloudflare Dashboard → Deployments → Retry last deployment

### Switching from static export to SSR (future)

If dynamic features (API routes, server actions) are needed later:

1. In `web/next.config.js`, change:
   ```js
   // Remove or comment out:
   output: 'export',
   images: { unoptimized: true },
   ```
2. In Cloudflare Pages, switch to **Cloudflare Workers** deployment mode
   (Pages project settings → Functions → select Node.js compatibility)
3. Or migrate to Vercel, which supports full Next.js SSR natively

---

## Quick Reference Card

```
Repo:        https://github.com/ddavidduncan/webelieveacademics
Site root:   web/
Build cmd:   npm run build
Output:      web/out/

Cloudflare Pages settings:
  Root dir:      web
  Build cmd:     npm run build
  Output dir:    out
  Node version:  18
  Env var:       NEXT_PUBLIC_FORMSPREE_ID = [formspree id]

Domain:      webelieveacademics.com (DNS on Cloudflare, proxy ON)
Form email:  hello@webelieveacademics.com
Formspree:   https://formspree.io (login with above email)
```
