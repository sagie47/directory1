# Business Function Pages

This document lists the newer pages tied to business claims, verification, owner management, and the related business-offer funnel.

## Core Verification and Admin Pages

- `/claim` -> [src/pages/ClaimPage.tsx](/workspaces/directory1/src/pages/ClaimPage.tsx)
  Business search and claim submission flow.
- `/claim/status` -> [src/pages/ClaimStatusPage.tsx](/workspaces/directory1/src/pages/ClaimStatusPage.tsx)
  Logged-in user view for pending, approved, rejected, or revoked claims.
- `/claim-business` -> [src/pages/ClaimBusinessPage.tsx](/workspaces/directory1/src/pages/ClaimBusinessPage.tsx)
  Landing page for the claim and verification funnel.
- `/owner/dashboard` -> [src/pages/OwnerDashboardPage.tsx](/workspaces/directory1/src/pages/OwnerDashboardPage.tsx)
  Approved-owner dashboard for listing management and recommendations.
- `/admin/claims` -> [src/pages/AdminClaimsPage.tsx](/workspaces/directory1/src/pages/AdminClaimsPage.tsx)
  Admin review queue for approving or rejecting claims.
- `/account` -> [src/pages/AccountPage.tsx](/workspaces/directory1/src/pages/AccountPage.tsx)
  Account settings page with claim and owner-flow entry points.

## Business Offer and Conversion Pages

- `/for-business` -> [src/pages/ForBusinessPage.tsx](/workspaces/directory1/src/pages/ForBusinessPage.tsx)
  Main business-facing hub that routes users into the claim-first funnel.
- `/never-miss-a-lead` -> [src/pages/NeverMissLeadPage.tsx](/workspaces/directory1/src/pages/NeverMissLeadPage.tsx)
  Lead-management offer page.
- `/book-demo` -> [src/pages/BookDemoPage.tsx](/workspaces/directory1/src/pages/BookDemoPage.tsx)
  Demo request page connected to the lead-management offer.
- `/websites-for-trades` -> [src/pages/WebsitesForTradesPage.tsx](/workspaces/directory1/src/pages/WebsitesForTradesPage.tsx)
  Website-services offer page for trade businesses.
- `/managed-growth` -> [src/pages/ManagedGrowthPage.tsx](/workspaces/directory1/src/pages/ManagedGrowthPage.tsx)
  Managed-growth services landing page.
- `/book-call` -> [src/pages/BookCallPage.tsx](/workspaces/directory1/src/pages/BookCallPage.tsx)
  General strategy or sales call booking page.

## Smallest Useful Subset

If someone only needs the pages directly involved in the verification path, start with:

- [src/pages/ClaimPage.tsx](/workspaces/directory1/src/pages/ClaimPage.tsx)
- [src/pages/ClaimStatusPage.tsx](/workspaces/directory1/src/pages/ClaimStatusPage.tsx)
- [src/pages/ClaimBusinessPage.tsx](/workspaces/directory1/src/pages/ClaimBusinessPage.tsx)
- [src/pages/OwnerDashboardPage.tsx](/workspaces/directory1/src/pages/OwnerDashboardPage.tsx)
- [src/pages/AdminClaimsPage.tsx](/workspaces/directory1/src/pages/AdminClaimsPage.tsx)
