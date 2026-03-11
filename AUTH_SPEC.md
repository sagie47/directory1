# Authentication & Portal MVP Specification

## Project Context

This repository is currently a public directory application built with Vite, React, and TypeScript.

Current implementation facts:

- Public directory pages are already routed from `src/App.tsx`
- `src/pages/SignupPage.tsx` exists today as a static "claim listing" style page
- Supabase is configured in `src/lib/supabase.ts`
- `DirectoryDataProvider` already reads public directory data from Supabase tables when configured:
  - `cities`
  - `category_groups`
  - `categories`
  - `businesses`
- If Supabase is not configured, the app falls back to seeded data

This spec revises the original plan to fit that architecture.

## Product Goal

Add authentication and business claiming without breaking the app's core public browsing flow.

## MVP Outcome

The MVP should support:

1. Consumer and business-owner login
2. Business claim submission against an existing listing
3. Manual approval of claims in Supabase
4. A minimal owner dashboard for approved claims
5. A safe place for owner-managed listing edits that will not be overwritten by future import/sync jobs

## Explicit Non-Goals For MVP

These are deferred until after the MVP is stable:

- Saved searches
- Review replies
- Analytics
- Photo uploads to storage
- Full admin UI
- Automated business verification workflow

Manual admin review in Supabase is acceptable for the first release.

## Design Principles

### 1. Public browsing stays public

The directory must remain usable without authentication.

### 2. `profiles` is the source of truth for app roles

Do not split role logic between auth metadata and database state.

### 3. User role and claim status are different concepts

- Role answers "what kind of actor is this user?"
- Claim status answers "what happened to this listing claim?"

### 4. Imported directory data remains canonical

The existing `businesses` table is currently part of the public directory data pipeline. Owner edits should not overwrite imported source fields directly unless that tradeoff is explicitly accepted.

### 5. Profile creation must be server-side

Do not rely on the client to create `profiles` rows after signup.

## Roles And States

### User roles

Store these in `profiles.role`:

- `consumer`
- `business_owner`
- `admin`

### Claim states

Store these in `business_claims.status`:

- `pending`
- `approved`
- `rejected`
- `revoked`

`pending` must not be treated as a user role.

## Recommended App Structure

```text
src/
├── contexts/
│   └── AuthContext.tsx
├── components/
│   ├── AuthGuard.tsx
│   └── UserMenu.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ClaimPage.tsx
│   ├── ClaimStatusPage.tsx
│   ├── AccountPage.tsx
│   └── OwnerDashboardPage.tsx
└── lib/
    ├── auth.ts
    └── supabase.ts
```

Notes:

- `SignupPage.tsx` should be refactored into `ClaimPage.tsx`
- Keep `/signup` as a redirect to `/claim` for backward compatibility
- A consumer dashboard is not required for MVP

## Route Plan

### Public routes

| Path | Purpose |
|------|---------|
| `/login` | Sign in |
| `/register` | Create account |
| `/claim` | Start or continue business claim flow |
| `/signup` | Redirect to `/claim` |

### Protected routes

| Path | Access | Purpose |
|------|--------|---------|
| `/account` | Any authenticated user | Basic account screen |
| `/claim/status` | Authenticated user | View current claim state |
| `/owner/dashboard` | Approved business owner | Edit owner-managed listing fields |

## Implementation Phases

## Phase 1: Auth Foundation

### 1.1 Auth context

Create `src/contexts/AuthContext.tsx` with:

- `user`
- `session`
- `profile`
- `loading`
- `signIn(email, password)`
- `signUp(email, password)`
- `signOut()`
- `refreshProfile()`

Responsibilities:

- Subscribe to `supabase.auth.onAuthStateChange`
- Load the signed-in user's `profiles` row
- Gracefully handle `supabase === null`

### 1.2 Profile bootstrap

Create profiles server-side with a database trigger on `auth.users`.

Recommended behavior:

- Insert a `profiles` row on signup
- Default `role` to `consumer`
- Copy email from `auth.users.email`

Do not make the client responsible for this insert.

### 1.3 Login and register pages

Add:

- `src/pages/LoginPage.tsx`
- `src/pages/RegisterPage.tsx`

MVP behavior:

- Email/password sign in with `signInWithPassword`
- Email/password sign up with `signUp`
- Clear loading and error states
- Optional email confirmation if enabled in Supabase

### 1.4 Auth guard

Create `src/components/AuthGuard.tsx`.

Behavior:

- Redirect unauthenticated users to `/login`
- Optionally require a role
- Render a loading state while auth/profile is resolving

Suggested prop shape:

```ts
interface AuthGuardProps {
  children: React.ReactNode;
  requireRole?: Array<'consumer' | 'business_owner' | 'admin'>;
}
```

### 1.5 Header integration

Create `src/components/UserMenu.tsx` and add it to `src/components/Layout.tsx`.

Logged out:

- Show `Sign In`
- Show `Claim Listing`

Logged in:

- Show email
- Show `Account`
- Show `Owner Dashboard` only when allowed
- Show `Sign Out`

## Phase 2: Claim Flow

### 2.1 Refactor the current signup page

The current `src/pages/SignupPage.tsx` is visually positioned as a contractor portal entry point. It should become the claim flow instead of a generic registration form.

Recommended rename:

- `src/pages/SignupPage.tsx` -> `src/pages/ClaimPage.tsx`

### 2.2 Claim flow behavior

Flow:

1. User opens `/claim`
2. If not authenticated, user signs in or registers first
3. User searches/selects an existing business listing
4. User submits supporting claim details
5. System creates a `business_claims` row with `status = 'pending'`
6. User is routed to `/claim/status`

Required fields for the MVP claim form:

- selected `business_id`
- claimant name
- claimant email
- claimant phone
- relationship to business
- optional message

### 2.3 Approval model

For MVP, claim approval is manual.

Admin workflow:

- Admin reviews claim in Supabase
- Admin sets `status = 'approved'` or `status = 'rejected'`
- On approval, user role may remain `business_owner`
- Access to `/owner/dashboard` is based on approved claim existence, not only role

Important:

- A user can have role `business_owner` and still have zero approved claims
- An approved claim is what unlocks business editing

## Phase 3: Owner Dashboard

### 3.1 Scope

The MVP dashboard should be intentionally small.

Allowed in MVP:

- View claimed business
- Edit owner-managed public fields
- Save changes

Deferred:

- Review responses
- Analytics
- Storage uploads
- Multiple business switching UI unless needed

### 3.2 Where owner edits should live

Do not write owner edits directly into imported `businesses` data for MVP.

Recommended approach:

- Keep `businesses` as the imported/canonical directory record
- Store owner-managed overrides separately in `business_overrides`
- Merge `business_overrides` into the public business object inside `DirectoryDataProvider`

This avoids:

- Import jobs overwriting owner edits
- Mixing generated data and owner-authored data without traceability

### 3.3 Fields that owners can manage in MVP

Recommended editable fields:

- `description`
- `contact.phone`
- `contact.website`
- `contact.email`
- `service_areas`
- `hours`
- `photos`

Not editable in MVP:

- `id`
- `city_id`
- `category_id`
- source metadata
- imported ratings/review counts

## Phase 4: Consumer Features

Consumer features should be treated as a separate phase after owner flows work.

### 4.1 Favorites

MVP-plus feature:

- Add favorite toggle to `BusinessCard.tsx`
- Store rows in `consumer_favorites`

### 4.2 Reviews

MVP-plus feature:

- Allow authenticated consumers to submit first-party directory reviews
- Store those reviews separately from imported source reviews

Important:

The app already displays imported reviews inside business data. First-party reviews must not be mixed into the same storage shape without a clear merge strategy.

## Database Schema

## 1. Profiles

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null check (role in ('consumer', 'business_owner', 'admin')) default 'consumer',
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## 2. Business claims

```sql
create table public.business_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_id text not null references public.businesses(id) on delete cascade,
  status text not null check (status in ('pending', 'approved', 'rejected', 'revoked')) default 'pending',
  claimant_name text not null,
  claimant_email text not null,
  claimant_phone text,
  relationship_to_business text not null,
  message text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index business_claims_user_id_idx on public.business_claims(user_id);
create index business_claims_business_id_idx on public.business_claims(business_id);

create unique index business_claims_one_pending_per_user_business_idx
  on public.business_claims(user_id, business_id)
  where status = 'pending';

create unique index business_claims_one_approved_per_business_idx
  on public.business_claims(business_id)
  where status = 'approved';
```

## 3. Business overrides

```sql
create table public.business_overrides (
  business_id text primary key references public.businesses(id) on delete cascade,
  description text,
  contact jsonb,
  service_areas text[],
  hours jsonb,
  photos text[],
  updated_by uuid not null references public.profiles(id),
  updated_at timestamptz not null default now()
);
```

`business_overrides` is the owner-managed layer merged onto public business data at read time.

## 4. Consumer favorites

```sql
create table public.consumer_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_id text not null references public.businesses(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, business_id)
);
```

## 5. First-party reviews

If first-party reviews are added later, use a dedicated table instead of writing into `businesses.reviews`.

```sql
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_id text not null references public.businesses(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  status text not null check (status in ('published', 'hidden')) default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, business_id)
);
```

## RLS Plan

Enable RLS explicitly on all auth-adjacent tables:

```sql
alter table public.profiles enable row level security;
alter table public.business_claims enable row level security;
alter table public.business_overrides enable row level security;
alter table public.consumer_favorites enable row level security;
alter table public.reviews enable row level security;
```

### Profiles policies

```sql
create policy "profiles_select_self"
on public.profiles
for select
using (auth.uid() = id);

create policy "profiles_update_self"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);
```

### Business claims policies

```sql
create policy "claims_insert_self"
on public.business_claims
for insert
with check (auth.uid() = user_id);

create policy "claims_select_self"
on public.business_claims
for select
using (auth.uid() = user_id);
```

Do not allow normal users to approve or reject claims through RLS. MVP approval is an admin/manual operation.

### Business overrides policies

Public users need read access because overrides affect the directory listing.

```sql
create policy "business_overrides_public_read"
on public.business_overrides
for select
using (true);
```

Approved owners may insert or update overrides only for businesses they have an approved claim for.

This is easiest to enforce with a SQL helper function or a policy subquery against `business_claims`.

Example shape:

```sql
create policy "business_overrides_owner_write"
on public.business_overrides
for all
using (
  exists (
    select 1
    from public.business_claims bc
    where bc.business_id = business_overrides.business_id
      and bc.user_id = auth.uid()
      and bc.status = 'approved'
  )
)
with check (
  exists (
    select 1
    from public.business_claims bc
    where bc.business_id = business_overrides.business_id
      and bc.user_id = auth.uid()
      and bc.status = 'approved'
  )
);
```

### Consumer favorites policies

```sql
create policy "favorites_manage_self"
on public.consumer_favorites
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

### Reviews policies

```sql
create policy "reviews_public_read_published"
on public.reviews
for select
using (status = 'published');

create policy "reviews_manage_self"
on public.reviews
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

## Required Data Flow Change

`DirectoryDataProvider` should eventually merge `business_overrides` into the public business result.

Conceptually:

1. Read `businesses`
2. Read `business_overrides`
3. Merge override fields onto the matching business record
4. Expose the merged result to the UI

This is the cleanest bridge between the existing directory architecture and owner editing.

## Auth Integration Notes

## Supabase client

Existing file:

- `src/lib/supabase.ts`

Keep:

- `persistSession: true`
- `autoRefreshToken: true`

All auth code must handle `supabase === null` gracefully in local/dev environments.

## Suggested route wiring changes

Add the new pages to `src/App.tsx` and preserve backward compatibility:

```tsx
<Route path="signup" element={<Navigate to="/claim" replace />} />
<Route path="claim" element={<ClaimPage />} />
<Route path="login" element={<LoginPage />} />
<Route path="register" element={<RegisterPage />} />
<Route
  path="account"
  element={
    <AuthGuard>
      <AccountPage />
    </AuthGuard>
  }
/>
<Route
  path="claim/status"
  element={
    <AuthGuard>
      <ClaimStatusPage />
    </AuthGuard>
  }
/>
<Route
  path="owner/dashboard"
  element={
    <AuthGuard requireRole={['business_owner', 'admin']}>
      <OwnerDashboardPage />
    </AuthGuard>
  }
/>
```

Note:

`OwnerDashboardPage` still needs an approved-claim check even when the user role is `business_owner`.

## Verification Strategy

There are two separate verification concepts:

### 1. Email verification

This is Supabase Auth email confirmation.

### 2. Business ownership verification

This is the claim approval decision.

The spec must keep these separate. Email confirmation alone does not prove ownership of a listing.

## Testing Checklist

### Auth

- User can register
- User can sign in
- User can sign out
- Unauthenticated user is redirected from protected routes
- `profiles` row is created automatically on signup

### Claims

- Authenticated user can submit a claim for an existing business
- Duplicate pending claim for the same user/business is blocked
- Approved claim unlocks owner dashboard access
- Rejected or pending claim does not unlock owner dashboard access

### Owner dashboard

- Approved owner can save overrides
- Public directory reads merged override values
- Imported source fields not meant to be editable remain unchanged

### Consumer features

- Consumer can favorite a business
- Consumer can remove a favorite
- Consumer reviews only appear when published

## Environment Variables

Required in `.env.local`:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_anon_key
```

## Final Recommendation

Build this in the following order:

1. Auth foundation
2. Claim submission
3. Manual approval process
4. Owner dashboard with `business_overrides`
5. Consumer favorites
6. First-party reviews

This order fits the current codebase, preserves the public directory, and avoids building owner features on top of an unstable data model.
