# Owner Dashboard Funnel PRD

## Product Summary

The owner dashboard should not be treated as a generic admin utility. It is the activation layer for the business-side funnel.

Today, the claim flow works, but approval leads to a thin edit form. That is not strong enough to justify the verification effort, build trust with business owners, or create a clear path into monetized offers.

The target product is:

1. a credible post-claim listing management experience
2. a clean activation flow after approval
3. a monetization funnel that moves qualified owners into paid products

The dashboard must first feel useful on its own. Only then should it upsell effectively.

## Problem

Business owners can claim a listing and get approved, but the post-approval experience is weak:

- the dashboard is mostly a form for a few override fields
- the status page promises more management power than the dashboard actually provides
- the public verified-state CTA is not aligned with owner vs non-owner intent
- there is no business-specific workspace model
- there is no meaningful “next step” logic beyond generic sales routing

This creates three risks:

1. low activation after approval
2. weak owner trust in the platform
3. poor conversion into paid offers

## Product Goal

Turn claim approval into a structured business funnel:

1. claim and approval establish ownership
2. owner completes and improves their listing
3. owner sees concrete value from having control
4. owner is routed into the next paid offer based on readiness and need

## Business Goal

Use the free claim product as the top of the monetization funnel.

The intended ladder is:

1. `Free Claim`
2. `Verified / Enhanced Profile`
3. `Never Miss a Lead`
4. `Websites for Trades`
5. `Managed Growth`

The dashboard should make this progression feel natural, not salesy or disconnected.

## Users

### Primary

- owner-operators
- office managers
- marketing/admin staff for a trade business

### Secondary

- internal admins reviewing claims and monitoring activation

## Core Product Principles

### 1. Approval must unlock a real workspace

After approval, the owner should feel they now control a business presence, not just a settings form.

### 2. The first owner task must be obvious

The first post-approval experience should focus on completing and improving the listing.

### 3. Monetization should follow readiness

Paid offers should appear after the owner has context and a reason to care, not as the first thing they see.

### 4. Public and owner experiences must not conflict

A public visitor, a logged-out owner, and an approved owner should not all see the same CTA on a verified listing.

## Scope

### In Scope for V1

- business-specific owner dashboard flow
- clear post-approval handoff from claim status
- stronger listing management experience
- useful activation checklist
- better verified-state CTA behavior
- monetization placements tied to owner readiness

### Out of Scope for V1

- full CMS
- team permissions / multi-seat accounts
- advanced analytics
- billing and subscription checkout
- automated lead inbox unless inquiry capture is built at the same time

## Current State

### What already exists

- claim submission
- claim status page
- admin approval page
- approved owner route guard
- business overrides for limited profile fields
- verified badge display driven from Supabase

### What is missing

- business-scoped owner workspace
- richer listing controls
- owner-specific deep links
- activation-focused onboarding after approval
- monetization logic tied to actual profile state
- separation between public trust CTAs and owner control CTAs

## V1 Product Requirements

## 1. Business-Scoped Owner Dashboard

Owners must land in a workspace for the specific business they just claimed.

### Requirements

- add a business-specific route, preferably `/owner/dashboard/:businessId`
- if the owner has one approved claim, route directly into that business workspace
- if the owner has multiple approved claims, show a selector before entering a workspace
- all post-approval CTAs should point to the relevant claimed business, not a generic dashboard

### Why this matters

This removes ambiguity and makes the product feel real. “Manage this business” should mean that exact business.

## 2. Listing Management That Feels Useful

The first version of the workspace should let the owner improve the quality of the listing in visible ways.

### Required sections

- business summary
- profile completeness / trust checklist
- editable contact info
- editable description
- editable service areas
- editable hours
- photo management if technically feasible in V1
- public listing preview link

### Nice-to-have if low effort

- “last updated” timestamp
- “changes are live” confirmation copy
- side-by-side source data vs owner override explanation

### Notes

If photo upload is not ready, do not imply it exists. Either build it or leave it out of the promise.

## 3. Post-Approval Activation Flow

Approval should trigger a clear next-step experience.

### Required behavior

- claim status approved state should say exactly what the owner can now do
- primary CTA should go to the claimed business workspace
- first owner session should emphasize:
  - complete your profile
  - review public listing
  - unlock next improvements

### Activation checklist examples

- add a business description
- confirm phone number
- add website
- confirm service areas
- add business hours
- review live listing

## 4. Verified Listing CTA Harmonization

Public business pages must handle verified state by viewer type.

### Required behavior

- anonymous or non-owner viewer:
  - see trust messaging only
  - do not see owner dashboard CTA
- logged-in approved owner of that business:
  - see `Manage Listing` CTA
- logged-in non-owner:
  - see neutral trust messaging, not owner controls
- unverified business:
  - continue to show claim CTA

### Key rule

The verified badge is for customer trust. Owner controls are for the owner only.

## 5. Monetization Surfaces Inside the Owner Flow

The dashboard must support monetization without overwhelming the owner before activation.

### Required approach

- free claim experience first proves value by improving listing control
- paid offers appear as contextual next steps
- upsells should map to listing condition or business need

### Suggested monetization logic

- incomplete profile:
  - prompt `Complete Your Listing`
  - no aggressive upsell yet
- complete profile, no website:
  - show `Websites for Trades`
- complete profile, website exists, likely busy operator:
  - show `Never Miss a Lead`
- high-intent / high-touch owners:
  - show `Managed Growth`

### Placement options

- right rail recommendation card
- post-save recommendation block
- completion state CTA after checklist is done

## 6. Admin and Verification Support

The owner flow must remain coherent with the admin review process.

### Required behavior

- admin approves claim
- approved claim updates verified state
- approved owner gets a clear path into management
- optional email notification should reinforce the same next step and link target

## Success Metrics

### Activation metrics

- claim approval to first dashboard visit
- first dashboard visit to first saved update
- percent of approved owners who complete core profile fields
- percent of approved owners who click public listing preview

### Monetization metrics

- percent of approved owners who click into paid offer pages
- conversion from owner dashboard to:
  - `/never-miss-a-lead`
  - `/websites-for-trades`
  - `/managed-growth`
- percent of owners reaching “profile complete” before upsell click

### Quality metrics

- lower owner confusion after approval
- fewer support questions about how to manage a listing
- reduced mismatch between public CTAs and actual owner permissions

## UX Requirements

- the owner workspace should feel operational, not promotional-first
- the first screen should answer “what do I do now?”
- copy should avoid overstating current capabilities
- every CTA should be role-correct
- if a feature is not implemented, the UI must not imply it is available

## Suggested Release Plan

## Phase 1: Make Approval Useful

- introduce business-scoped dashboard routing
- improve approved-state CTAs
- strengthen listing-management UX
- add activation checklist and preview flow

## Phase 2: Make the Funnel Intelligent

- refine recommendation logic based on profile completeness
- improve contextual upsells
- track owner activation and conversion events more cleanly

## Phase 3: Expand Monetizable Owner Value

- photo management
- inquiry or lead inbox
- enhanced profile or verified-plan differentiation
- higher-touch managed service handoff

## Engineering Notes

- keep `business_overrides` as the source for owner-edited fields
- ensure the directory layer always merges overrides into the rendered business
- prefer business-specific routing over global owner state assumptions
- avoid hardcoding paid-plan promises until billing and entitlement logic exist
- keep owner copy consistent across:
  - claim status
  - business page
  - account page
  - owner dashboard
  - notification emails

## Open Product Questions

- is `Verified Profile` a paid plan, a review state, or both?
- should photo management ship in V1 or wait until storage workflow is ready?
- should `Never Miss a Lead` remain a sales page first, or become a true in-app product over time?
- do we want a distinct enhanced-listing plan before pushing service offers?

## Final Direction

The dashboard should be the bridge between verification and revenue.

It must first help the owner improve and trust their listing. Once that value is established, the product should route them into the next paid offer based on what their business is missing and what problem they are most likely trying to solve.
