# Business Offer Flow Plan

## Goal

Restructure the business side of the site into clear offer lanes instead of blending claim tools, lead capture, websites, and managed services into one page.

This should make `/for-business` a routing page, not a catch-all sales page.

## Offer Ladder

1. `Claim & Manage Profile`
2. `Never Miss a Lead`
3. `Websites for Trades`
4. `Managed Growth`

This keeps the progression clear:
- low-friction directory entry
- operational painkiller
- credibility / conversion upgrade
- high-ticket managed service

## Route Map

### Keep

- `/for-business`
- `/claim`
- `/claim/status`
- `/never-miss-a-lead`
- `/book-demo`
- `/demo-requested`

### Add

- `/websites-for-trades`
- `/managed-growth`
- `/book-call`
- `/call-requested`

## Funnel Map

### Claim lane

`/for-business` -> `/claim` -> auth/search/select -> `/claim/status`

### Lead capture lane

`/for-business` or direct outreach -> `/never-miss-a-lead` -> `/book-demo` -> `/demo-requested`

### Website lane

`/for-business` or direct outreach -> `/websites-for-trades` -> `/book-call?offer=website` -> `/call-requested`

### Managed growth lane

`/for-business` or referral -> `/managed-growth` -> `/book-call?offer=managed-growth` -> `/call-requested`

## `/for-business` Role

Turn this into a business offer hub.

### Recommended structure

1. Hero
   - Headline: `Built for Okanagan Trade Businesses`
   - Subheadline: claim your profile, stop missing leads, improve your website, or get ongoing growth help
   - Primary CTA: `Claim Your Profile`
   - Secondary CTA: `See Business Options`

2. Choose What You Need
   - 4 offer cards
   - each card gets one job, one short description, one CTA

3. Split the model clearly
   - `Directory Plans`
   - `Growth Services`

4. Light proof / reassurance
   - built for local trades
   - practical, not bloated
   - designed around missed calls, credibility, and follow-up

### Card structure

#### Claim & Manage Profile
- Outcome: keep your listing accurate and under your control
- CTA: `Claim Your Profile`
- Route: `/claim`

#### Never Miss a Lead
- Outcome: respond faster when calls are missed
- CTA: `Book a Demo`
- Route: `/never-miss-a-lead`

#### Websites for Trades
- Outcome: look credible and make it easier to contact you
- CTA: `Book a Website Call`
- Route: `/websites-for-trades`

#### Managed Growth
- Outcome: ongoing help with visibility, lead handling, and online presence
- CTA: `Book a Strategy Call`
- Route: `/managed-growth`

## `/websites-for-trades`

This should sell a better business website, not generic design.

### Core promise

Modern, fast, mobile-first websites for contractors who need to look credible and make it easier for customers to reach out.

### Page structure

1. Hero
   - Headline: `Trade Websites That Actually Help You Win Work`
   - Primary CTA: `Book a Website Call`

2. Problem
   - outdated trade websites make good businesses look less trustworthy

3. What a better site does
   - clearer service pages
   - better mobile experience
   - stronger first impression
   - easier contact flow

4. What is included
   - homepage
   - service pages
   - contact / call flow
   - trust signals
   - local-service positioning

5. Process
   - audit
   - build
   - launch

6. CTA block

## `/managed-growth`

This is the highest-ticket lane and should feel more selective.

### Core promise

Done-for-you local growth support for contractors who need visibility and lead handling support without more admin.

### Page structure

1. Hero
   - Headline: `Done-For-You Local Growth for Trade Businesses`
   - Primary CTA: `Book a Strategy Call`

2. Who this is for
   - growing trade businesses
   - owners stretched thin
   - teams with inconsistent online upkeep

3. What we handle
   - profile updates
   - review / reputation support
   - lead-response support
   - content and visibility improvements
   - reporting / strategy

4. What you see
   - cleaner presence
   - faster follow-up
   - fewer missed opportunities

5. CTA block

## CTA Rules

Do not reuse one generic CTA everywhere.

- Claim: `Claim Your Profile`
- Lead capture: `Book a Demo`
- Website: `Book a Website Call`
- Managed growth: `Book a Strategy Call`

## Conversion Pages

### `/book-demo`

Keep this focused on the lead-capture offer.

### `/book-call`

Use this as the shared higher-intent service intake page for:
- website builds
- managed growth

Recommended behavior:
- read `offer` from the query string
- adjust headline, intro copy, and submit CTA
- examples:
  - `offer=website` -> `Book a Website Call`
  - `offer=managed-growth` -> `Book a Strategy Call`

### `/call-requested`

Shared thank-you page for service inquiries.

## Pricing Structure

Do not force all offers into one pricing table.

### Directory Plans

- Free Claim
- Verified Profile

### Growth Services

- Never Miss a Lead
- Website Build
- Managed Growth

## Current-to-Target Migration

### Current

- `/for-business` currently emphasizes:
  - claim / manage profile
  - lead response
  - pricing with managed growth mixed into the plan stack

### Target

1. simplify `/for-business` into a router page
2. keep `/never-miss-a-lead` as its own focused sales page
3. add `/websites-for-trades`
4. add `/managed-growth`
5. add `/book-call` and `/call-requested`
6. stop treating `Managed Growth` as just another directory plan

## Implementation Order

1. Update `/for-business` into a 4-lane business hub
2. Add `/websites-for-trades`
3. Add `/managed-growth`
4. Add `/book-call`
5. Add `/call-requested`
6. Update nav/footer/business CTAs to route into the correct lane

## Notes for This Repo

- Keep the current hard-edged visual language used across the live site.
- Avoid route collisions with dynamic city routes by using explicit slugs like:
  - `/websites-for-trades`
  - `/managed-growth`
  - `/book-call`
- Do not collapse these into one generic services page.
