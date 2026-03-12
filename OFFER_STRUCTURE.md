# Offer Structure

## Overview
The site currently presents two main commercial offers:

1. A consumer-facing contractor directory for finding trades by city and category.
2. A business-facing growth offer made up of listing management and lead-response services.

## Consumer Offer
- Core value: help homeowners and property managers find local trades across BC Interior / Okanagan cities.
- Main entry points:
  - Home search
  - Region pages
  - Trade pages
  - City pages
  - Category pages
  - Business detail pages
- Positioning language emphasizes:
  - verified contractors
  - trusted local professionals
  - regional coverage
  - precision / premium directory framing

## Business Offer
The business side is split into two paths on [ForBusinessPage](/workspaces/directory1/src/pages/ForBusinessPage.tsx):

### 1. Claim and Manage Profile
- Goal: let businesses own and manage their directory presence.
- Core actions:
  - claim listing
  - update services, hours, contact details, photos, service areas
  - access owner dashboard
- Primary CTA:
  - `/claim`

### 2. Lead Capture System
- Goal: help trades stop losing inbound calls and slow follow-up opportunities.
- Main promise:
  - missed-call text back
  - AI receptionist / call screening
  - quote follow-up
- Positioning:
  - best for busy crews, owner-operators, and shops without full-time office staff
  - “Never Miss a Lead” is the headline offer page
- Primary CTA:
  - `/never-miss-a-lead`
  - secondary conversion path: `/book-demo`

## Pricing / Plans
Current plan stack on [ForBusinessPage](/workspaces/directory1/src/pages/ForBusinessPage.tsx):

- `Free Claim`:
  - $0
  - claim profile, update core info, add photos/service areas, receive inquiries, owner dashboard
- `Verified Profile`:
  - $29/month
  - includes free tier plus verified badge, priority placement, enhanced profile, analytics, priority support
- `Managed Growth`:
  - custom pricing
  - includes verified tier plus profile management, content creation, lead response service, strategy calls, reporting

## Lead Funnel
Current lead funnel:

1. `/never-miss-a-lead`
2. `/book-demo`
3. `/demo-requested`

This is currently a sales/demo intake flow, not a live checkout flow.

## Claim Funnel
Current profile-ownership funnel:

1. `/claim`
2. auth gate if needed
3. business search and selection
4. claim submission
5. `/claim/status`
