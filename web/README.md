# We Believe Academics — Marketing Site

Next.js 14 (App Router) · Tailwind CSS · TypeScript
Premium, family-focused education marketing site for **webelieveacademics.com**.

---

## Project structure

```
web/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (Navbar + Footer + fonts + meta)
│   ├── globals.css         # Tailwind base + custom CSS classes
│   ├── page.tsx            # Home page
│   ├── about/page.tsx
│   ├── programs/page.tsx
│   ├── how-it-works/page.tsx
│   └── contact/page.tsx
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx      # Sticky navbar with mobile menu
│   │   └── Footer.tsx      # 4-column footer
│   ├── home/               # Home page section components
│   │   ├── Hero.tsx
│   │   ├── TrustBar.tsx
│   │   ├── WhyWeBelieve.tsx
│   │   ├── ProgramsTeaser.tsx
│   │   ├── HowItWorksTeaser.tsx
│   │   ├── Testimonials.tsx
│   │   └── FooterCTA.tsx
│   ├── contact/
│   │   └── ContactForm.tsx # Formspree-powered contact form
│   └── ui/
│       ├── AnimateIn.tsx   # Scroll-triggered fade-up wrapper
│       ├── Button.tsx      # Reusable button (link or button element)
│       └── SectionHeader.tsx
├── lib/
│   └── utils.ts            # cn() Tailwind class merger
├── public/
│   └── logo.svg            # Brand logo mark
├── .env.local.example      # Environment variable template
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## Local development

### Prerequisites
- Node.js 18+ (check: `node -v`)
- npm 9+ or pnpm/yarn

### Steps

```bash
# 1. Navigate to the web directory
cd web

# 2. Install dependencies
npm install

# 3. Copy env template
cp .env.local.example .env.local
# Then edit .env.local and add your Formspree form ID

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — changes hot-reload instantly.

### Build for production

```bash
npm run build        # Creates static export in /out
npm run typecheck    # Type-check without building
```

---

## Formspree setup (contact form)

1. Go to [formspree.io](https://formspree.io) and create a **free account**
2. Click **New Form**, name it "WBA Consultation Requests"
3. Copy your **Form ID** (looks like `xpznkgvb`)
4. Open `.env.local` and set:
   ```
   NEXT_PUBLIC_FORMSPREE_ID=xpznkgvb
   ```
5. Done — form submissions go straight to your email

Free tier: 50 submissions/month. Paid plans start at $10/month for unlimited.

---

## Deploy to Cloudflare Pages

### One-time setup

1. Push this repo to GitHub (already done)
2. Log into [Cloudflare Dashboard](https://dash.cloudflare.com) → **Pages** → **Create a project**
3. Connect your GitHub account and select the `webelieveacademics` repo
4. Configure build settings:

| Setting | Value |
|---|---|
| **Root directory** | `web` |
| **Build command** | `npm run build` |
| **Build output directory** | `out` |
| **Node.js version** | `18` |

5. Add environment variable:
   - `NEXT_PUBLIC_FORMSPREE_ID` → your Formspree form ID

6. Click **Save and Deploy**

Cloudflare Pages gives you: free hosting, global CDN, automatic deploys on every `git push`, and a free `*.pages.dev` preview URL before pointing your real domain.

### Connect your domain

In Cloudflare Pages → your project → **Custom domains** → Add `webelieveacademics.com`.
Since DNS is already on Cloudflare, it configures automatically.

---

## Deploy to Vercel (alternative)

```bash
npm i -g vercel
cd web
vercel --prod
```

Or connect via [vercel.com](https://vercel.com) dashboard → Import Git Repository → set **Root Directory** to `web`.

---

## Design system

| Token | Color | Usage |
|---|---|---|
| Teal `teal-600` | `#0D9488` | Primary brand, links, eyebrows |
| Navy `blue-900` | `#1E3A8A` | Headings, authority, footer bg |
| Green `emerald-500` | `#10B981` | CTA buttons |
| Cream `cream` | `#FEF3E8` | Hero bg, warm section bg |
| Gray `gray-500` | `#6B7280` | Body text |

**Fonts:** Playfair Display (headings) + Inter (body) — loaded via `next/font/google`

---

## Swapping placeholder content

| Item | Location | What to update |
|---|---|---|
| Phone number | `Footer.tsx`, `contact/page.tsx` | Replace `(555) 555-0100` |
| Email address | `Footer.tsx`, `contact/page.tsx` | Replace `hello@webelieveacademics.com` |
| Testimonials | `Testimonials.tsx` | Replace placeholder quotes with real ones |
| Social links | `Footer.tsx` | Replace `href="#"` with real URLs |
| Privacy / Terms | `Footer.tsx` | Link to real policy pages |

---

## Recommended stock images (Unsplash / Pexels — free, commercial use)

Search keywords for each section:

| Section | Keywords |
|---|---|
| Hero | `child reading teacher warm light`, `one on one tutoring desk sunlight` |
| About | `teacher student smiling connection`, `private tutoring natural light` |
| Programs | `homeschool family study`, `SAT test prep teenager`, `child organization planner` |
| Testimonials | `happy family education`, `confident student` |

Add images to `public/images/` and reference as `/images/photo.jpg` in any `<img>` tag.
