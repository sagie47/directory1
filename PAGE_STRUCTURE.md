# Lead Capture Funnel Plan

## Purpose

This document combines:

- the original funnel thinking from `/home/codespace/.local/share/opencode/plans/lead-capture-funnel.md`
- the earlier page-structure direction
- the current state of the live directory app in `/workspaces/directory1`

The result is not a blank-slate build plan. The funnel already exists in the app. The correct next step is to tighten it, connect it to the business-owner journey, and make it operational.

## Current State

### What already exists

- Marketing routes already exist in [src/App.tsx](/workspaces/directory1/src/App.tsx#L61):
  - `/never-miss-a-lead`
  - `/book-demo`
  - `/demo-requested`
- The three pages are already implemented:
  - [src/pages/NeverMissLeadPage.tsx](/workspaces/directory1/src/pages/NeverMissLeadPage.tsx)
  - [src/pages/BookDemoPage.tsx](/workspaces/directory1/src/pages/BookDemoPage.tsx)
  - [src/pages/DemoRequestedPage.tsx](/workspaces/directory1/src/pages/DemoRequestedPage.tsx)
- The directory already has a business-owner acquisition surface:
  - `/for-business`
  - `/claim`
  - `/claim-business`
  - owner account/dashboard flows
- The site already has a strong top-of-funnel asset:
  - public directory pages
  - city/category/business pages
  - “for business” positioning

### What is not finished

- The lead-capture funnel is live, but it behaves like a standalone concept page, not an integrated business acquisition system.
- `/for-business` still points users mainly toward claiming a profile or contacting manually, instead of routing them into the lead-capture offer in a deliberate way.
- `/book-demo` is still fake-submit:
  - client-side timeout
  - no persistence
  - no CRM/backend
  - no anti-spam
  - no structured lead source tracking
- `DemoRequestedPage` assumes confirmation behavior that is not actually connected to a backend submission.
- Funnel styling is serviceable, but it is softer and more SaaS-like than the harder-edged directory style used elsewhere.
- Business-owner CTAs across the app are fragmented:
  - some push `/claim`
  - some push `/claim-business`
  - some push `/for-business`
  - the funnel pushes `/book-demo`
- The current funnel is about “AI receptionist / missed-call capture”, but the rest of the directory mostly sells:
  - listing ownership
  - profile visibility
  - business verification
  - managed presence

That mismatch is the main strategic issue.

## Core Decision

The directory should not treat the lead-capture funnel as a separate mini-site.

It should position the funnel as the highest-intent upgrade path for business owners who want more than a free claim.

That means:

1. `Claim / directory ownership` remains the low-friction entry point.
2. `For business` becomes the bridge page.
3. `Never miss a lead` becomes the conversion page for higher-value managed service / software-assisted lead handling.
4. `Book demo` becomes the operational intake page.

## Recommended Funnel Architecture

### Primary structure

1. Public directory and profile discovery
2. Business-owner interest page: `/for-business`
3. Offer page: `/never-miss-a-lead`
4. Conversion page: `/book-demo`
5. Confirmation page: `/demo-requested`

### Supporting business-owner structure

1. `/claim-business`
2. `/claim`
3. `/claim/status`
4. `/owner/dashboard`

### Role of each page

- `/for-business`
  - explain business-owner options clearly
  - separate “claim your profile” from “improve lead response”
  - route the right user to the right path

- `/never-miss-a-lead`
  - sell the pain and solution
  - qualify the reader
  - create urgency for booking a demo

- `/book-demo`
  - collect lead data cleanly
  - capture source and intent
  - move into CRM / email / notification workflow

- `/demo-requested`
  - confirm submission
  - set expectations
  - offer next best action inside the directory

## Recommended Messaging Hierarchy

The current directory has two business offers. They need to be separated clearly.

### Offer 1: Free / self-serve

- Claim your listing
- Update your profile
- Manage your presence

### Offer 2: Premium / assisted

- Never miss inbound leads
- Missed-call text back
- AI receptionist / screening
- Quote follow-up
- Managed lead handling

### Required copy distinction

Do not blur these together.

Bad:
- “Claim your listing and never miss leads” everywhere

Better:
- “Claim your profile for free”
- “Need help handling incoming leads too? See the lead-capture system”

## Implementation Plan

### Phase 1: Reposition what already exists

Goal: make the existing funnel coherent inside the directory.

Tasks:

- Update `/for-business` to present two clear paths:
  - `Claim Your Profile`
  - `See Lead Capture System`
- Add a dedicated CTA from `/for-business` to `/never-miss-a-lead`
- Audit global CTAs and decide intent by context:
  - listing management CTA -> `/claim` or `/claim-business`
  - lead-response CTA -> `/never-miss-a-lead`
- Add funnel links in places where business intent is already strong:
  - owner-focused sections on home page
  - business page sidebar CTA
  - footer business section

Acceptance:

- a business owner can understand the difference between claiming a profile and booking a demo
- `/for-business` becomes the main decision page, not just a pricing page

### Phase 2: Make the demo form real

Goal: convert `/book-demo` from mock flow into a real lead intake.

Tasks:

- Replace timeout-based submit in [src/pages/BookDemoPage.tsx](/workspaces/directory1/src/pages/BookDemoPage.tsx#L55)
- Persist submissions to a backend table or CRM bridge
- Capture metadata:
  - source page
  - referrer
  - campaign params
  - timestamp
- Add server-side notification path:
  - email
  - webhook
  - CRM push
- Add submission states:
  - loading
  - success
  - recoverable error
  - validation error
- Add spam controls:
  - honeypot or rate limit
  - basic bot mitigation

Recommended initial schema:

- `demo_requests`
  - `id`
  - `created_at`
  - `name`
  - `business_name`
  - `trade`
  - `phone`
  - `email`
  - `city`
  - `website`
  - `leads_per_week`
  - `biggest_issue`
  - `source_path`
  - `utm_source`
  - `utm_medium`
  - `utm_campaign`
  - `notes`
  - `status`

Acceptance:

- demo requests are persisted
- admin can review them
- confirmation only appears after a real successful submission

### Phase 3: Align visual system with the live directory

Goal: make the funnel feel like part of the same product.

Tasks:

- Reduce SaaS-style softness on funnel pages:
  - less `rounded-3xl`
  - stronger borders
  - more structural layout rhythm
  - sharper CTA hierarchy
- Match the live directory’s stronger visual language:
  - uppercase headings
  - mono utility labels
  - zinc/orange palette
  - industrial framing
- Keep motion restrained and directional
- Make mobile spacing and conversion blocks tighter

Specific cleanup targets:

- [src/pages/NeverMissLeadPage.tsx](/workspaces/directory1/src/pages/NeverMissLeadPage.tsx)
- [src/pages/BookDemoPage.tsx](/workspaces/directory1/src/pages/BookDemoPage.tsx)
- [src/pages/DemoRequestedPage.tsx](/workspaces/directory1/src/pages/DemoRequestedPage.tsx)

Acceptance:

- funnel pages no longer feel visually detached from the rest of the site

### Phase 4: Connect funnel to business-owner lifecycle

Goal: use the directory to pre-qualify and enrich the lead-capture offer.

Tasks:

- Add contextual CTA on business owner surfaces:
  - “Already getting calls? See how to stop missing them”
- From claim/account/dashboard views, upsell lead-capture only when appropriate
- Prefill demo form when user is authenticated:
  - email
  - business name if known
  - city if known
- If the user has an approved claim, allow the demo form to attach to their business record

Acceptance:

- the funnel benefits from existing directory identity and business data
- repeat business owners do not re-enter unnecessary information

### Phase 5: Add segmented acquisition pages

Goal: improve campaign performance without colliding with directory routing.

Tasks:

- Add trade-specific pages under a safe namespace:
  - `/lead-capture/plumbers`
  - `/lead-capture/electricians`
  - `/lead-capture/hvac`
  - `/lead-capture/roofers`
- Do not use top-level slugs like `/plumbers` because directory dynamic routes already occupy simple top-level patterns.
- Tailor examples, pain points, and proof by trade

Acceptance:

- targeted pages exist for outreach and ads
- routing stays compatible with `/:cityId`

## Immediate Code Issues To Fix

These are small but important cleanup items already visible in the current implementation.

- [src/pages/BookDemoPage.tsx](/workspaces/directory1/src/pages/BookDemoPage.tsx#L118)
  - broken input class string: `text-z-none focus:borderinc-900`
- [src/pages/BookDemoPage.tsx](/workspaces/directory1/src/pages/BookDemoPage.tsx#L55)
  - fake submit with `setTimeout`
- [src/pages/ForBusinessPage.tsx](/workspaces/directory1/src/pages/ForBusinessPage.tsx)
  - no strong route into `/never-miss-a-lead`
- [src/components/Layout.tsx](/workspaces/directory1/src/components/Layout.tsx#L166)
  - business footer navigation still emphasizes listing flows only

## Recommended Route Strategy

Keep these routes:

- `/for-business`
- `/claim-business`
- `/claim`
- `/claim/status`
- `/owner/dashboard`
- `/never-miss-a-lead`
- `/book-demo`
- `/demo-requested`

Add later:

- `/lead-capture/:trade`

Do not add:

- top-level trade marketing slugs that compete with city or category routing

## Success Metrics

Track at minimum:

- visits to `/for-business`
- click-through from `/for-business` to `/never-miss-a-lead`
- click-through from `/never-miss-a-lead` to `/book-demo`
- form completion rate on `/book-demo`
- claim-to-demo crossover rate
- authenticated owner-to-demo conversion rate

## Recommended Next Build Order

1. Fix `/for-business` positioning and CTA routing
2. Replace fake submit on `/book-demo` with real persistence
3. Clean up funnel styling to match the directory
4. Add source tracking and admin review flow
5. Add authenticated prefill and business linkage
6. Add trade-specific campaign pages

## Summary

The correct plan is not “build a three-page funnel from scratch.”

That work is mostly done.

The correct plan is:

1. unify the business-owner story
2. turn the demo form into a real intake workflow
3. make the funnel visually and strategically part of the directory
4. only then expand into trade-specific acquisition pages
