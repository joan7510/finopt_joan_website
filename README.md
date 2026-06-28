# Meridian Analytics — Concept Website

A single-page concept site for a personal data analytics & AI strategy
consultancy, modelled on the structure of Pitcher Partners' data analytics
page, adapted for a solo practitioner brand.

## Files

- `index.html` — the entire site (HTML, CSS, and a small inline animation).
  No build step, no dependencies, no external JS libraries. Fonts load from
  Google Fonts via CDN link in the `<head>`.
- `assets/` — empty, reserved for a logo, favicon, or photos if you add them
  later (see "Next steps" below).

## How to preview it

Just open `index.html` directly in any browser — double-click the file, or
drag it into a browser window. No server required.

## How to publish it (free hosting)

This file is already structured to drop straight into a static host with
zero changes:

1. **Netlify Drop** (easiest): go to https://app.netlify.com/drop and drag
   the whole folder in. You get a live URL in seconds. Free tier, no account
   strictly required to start.
2. **GitHub Pages**: push this folder to a GitHub repo, then enable Pages in
   the repo settings (Settings → Pages → deploy from main branch / root).
   Free, and gives you a `yourname.github.io` URL plus easy version history.
3. **Cloudflare Pages**: similar to GitHub Pages, also free, slightly more
   setup but better performance/analytics if you want to grow this later.

All three are genuinely free for a single static page like this — no card
required for Netlify Drop or GitHub Pages.

Once you have a custom domain, all three platforms let you connect it
directly in their dashboard (just point your domain's DNS at them).

## Design notes (for future edits)

**Palette**
| Token | Hex | Use |
|---|---|---|
| `--teal-deep` | `#0B2B26` | Header logo text, dark section backgrounds, buttons |
| `--teal` | `#11423B` | (reserved, secondary dark) |
| `--teal-signal` | `#1F6F5C` | Accent: eyebrows, links, sparkline, icons |
| `--bg` | `#F7F5F0` | Page background (warm off-white, not stark white) |
| `--bg-raised` | `#FFFFFF` | Cards / raised panels |
| `--ink` | `#16201D` | Body text |
| `--sage-line` | `rgba(11,43,38,0.14)` | Hairline dividers on light sections |

**Type**
- Display: `Fraunces` (serif) — used for all headings, conveys authority/trust
- Body: `IBM Plex Sans` — clean, neutral, easy to scan
- Data/labels: `IBM Plex Mono` — used for eyebrows, step numbers, the
  sparkline caption — ties typography back to the "data" subject matter

**Signature element**
The hero sparkline animates from a jittery/noisy line into a clean upward
trend on page load — a literal visual metaphor for "raw data → clear
strategy," the core promise of the business. Respects
`prefers-reduced-motion` (skips straight to the clean line if a visitor has
that setting on).

**Section structure** (mirrors the Pitcher Partners page this was modelled
on, adapted for a one-person brand instead of a multi-office firm):
1. Hero — value proposition + sparkline
2. Problems (dark band) — 3 common pain points
3. Solutions — 6-item service grid
4. Approach — 4-step process (Understand → Pilot → Prove → Scale)
5. About — replaces Pitcher's team grid with a single-person trust section
6. CTA band — "Book a free consultation"
7. Footer

## Known placeholders still to replace before going fully live

- [x] **Formspree form ID** — done. The contact form posts to
      `https://formspree.io/f/meebkzjp`, set to deliver to
      `finopt_au@gmail.com`. **Remember:** Formspree requires one real test
      submission through the *live* form before it activates — fill it out
      yourself once after publishing and confirm you receive the email.
- [ ] **Footer links** — LinkedIn / Privacy currently point to `#`. (Email
      is already wired to `mailto:finopt_au@gmail.com`.)
- [ ] **Favicon** — none set yet. Drop a `favicon.ico` or `favicon.png` in
      `assets/` and add a `<link rel="icon" href="assets/favicon.png">` in
      the `<head>`.

## Contact modal

All three "Book a free consultation" buttons (header, hero, closing CTA
band) open the same inline modal — no page navigation, no external booking
tool required.

- **Form fields**: name, email (required); company, phone (optional);
  message (required).
- **Submission**: posts to Formspree via fetch/JSON, shows an inline
  success or error message without leaving the page.
- **Fallback**: the modal also shows direct email (`finopt_au@gmail.com`)
  and phone (`0426 005 000`) links below the form for anyone who prefers
  not to fill it in.
- **Accessibility**: traps focus into the modal on open, returns focus to
  the trigger button on close, closes on `Escape` or click outside,
  uses `aria-modal` and `aria-hidden` appropriately.

## Change log

- 2026-06-28 — Initial concept built, based on Pitcher Partners' data
  analytics page structure. Deep teal palette, Fraunces/IBM Plex type
  pairing, animated sparkline signature element.
- 2026-06-28 — Rebranded from placeholder "Meridian Analytics" to **FinOpt**.
  Rewrote the About section and CTA band with real bio: 10+ years in
  advanced data analytics and data science, case studies in customer
  retention, pricing optimisation, context analysis, and monthly trend
  reporting/prediction.
- 2026-06-28 — Added inline contact modal (replacing dead `#` booking
  links) with a Formspree-powered form and direct email/phone fallback.
  Contact email set to finopt_au@gmail.com, phone 0426 005 000.
- 2026-06-28 — Connected the live Formspree form ID (`meebkzjp`). Form is
  now wired end-to-end — still needs one real test submission after the
  site is published to fully activate on Formspree's side.


