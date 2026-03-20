create extension if not exists "pgcrypto";

create table if not exists public.cities (
  id text primary key,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.category_groups (
  id text primary key,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text primary key,
  group_id text references public.category_groups (id) on delete set null,
  name text not null,
  icon text,
  created_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id text primary key,
  city_id text not null references public.cities (id) on delete cascade,
  category_id text not null references public.categories (id) on delete cascade,
  name text not null,
  description text,
  rating numeric(3, 2),
  review_count integer,
  service_areas jsonb not null default '[]'::jsonb,
  category_tags jsonb not null default '[]'::jsonb,
  specialties jsonb not null default '[]'::jsonb,
  photos jsonb not null default '[]'::jsonb,
  reviews jsonb not null default '[]'::jsonb,
  hours jsonb not null default '{}'::jsonb,
  coordinates jsonb,
  contact jsonb not null default '{}'::jsonb,
  source jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists businesses_city_id_idx on public.businesses (city_id);
create index if not exists businesses_category_id_idx on public.businesses (category_id);
create index if not exists businesses_name_idx on public.businesses (name);
create index if not exists businesses_rating_idx on public.businesses (rating desc nulls last);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists businesses_set_updated_at on public.businesses;

create trigger businesses_set_updated_at
before update on public.businesses
for each row
execute function public.set_updated_at();

alter table public.cities enable row level security;
alter table public.category_groups enable row level security;
alter table public.categories enable row level security;
alter table public.businesses enable row level security;

drop policy if exists "Public read cities" on public.cities;
create policy "Public read cities"
on public.cities
for select
to anon, authenticated
using (true);

drop policy if exists "Public read category groups" on public.category_groups;
create policy "Public read category groups"
on public.category_groups
for select
to anon, authenticated
using (true);

drop policy if exists "Public read categories" on public.categories;
create policy "Public read categories"
on public.categories
for select
to anon, authenticated
using (true);

drop policy if exists "Public read businesses" on public.businesses;
create policy "Public read businesses"
on public.businesses
for select
to anon, authenticated
using (true);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  role text not null default 'consumer' check (role in ('consumer', 'business_owner', 'admin')),
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  business_id text not null references public.businesses (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'revoked')),
  claimant_name text not null,
  claimant_email text not null,
  claimant_phone text,
  relationship_to_business text not null,
  message text,
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  notification_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_overrides (
  business_id text primary key references public.businesses (id) on delete cascade,
  name text,
  description text,
  contact jsonb,
  service_areas text[],
  hours jsonb,
  photos text[],
  updated_by uuid not null references public.profiles (id) on delete cascade,
  updated_at timestamptz not null default now()
);

alter table public.business_overrides add column if not exists name text;

create index if not exists business_claims_user_id_idx on public.business_claims (user_id);
create index if not exists business_claims_business_id_idx on public.business_claims (business_id);

create unique index if not exists business_claims_one_pending_per_user_business_idx
  on public.business_claims (user_id, business_id)
  where status = 'pending';

create unique index if not exists business_claims_one_approved_per_business_idx
  on public.business_claims (business_id)
  where status = 'approved';

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists business_claims_set_updated_at on public.business_claims;
create trigger business_claims_set_updated_at
before update on public.business_claims
for each row
execute function public.set_updated_at();

drop trigger if exists business_overrides_set_updated_at on public.business_overrides;
create trigger business_overrides_set_updated_at
before update on public.business_overrides
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;

create or replace function public.protect_profile_admin_fields()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if new.email is distinct from old.email then
    raise exception 'Email cannot be changed from the client.';
  end if;

  if new.role is distinct from old.role then
    raise exception 'Role cannot be changed from the client.';
  end if;

  if new.id is distinct from old.id then
    raise exception 'Profile identity cannot be changed.';
  end if;

  if new.created_at is distinct from old.created_at then
    raise exception 'Profile creation timestamp cannot be changed.';
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

drop trigger if exists profiles_protect_admin_fields on public.profiles;
create trigger profiles_protect_admin_fields
before update on public.profiles
for each row
execute function public.protect_profile_admin_fields();

alter table public.profiles enable row level security;
alter table public.business_claims enable row level security;
alter table public.business_overrides enable row level security;

drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "claims_insert_self" on public.business_claims;
create policy "claims_insert_self"
on public.business_claims
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "claims_select_self" on public.business_claims;
create policy "claims_select_self"
on public.business_claims
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "claims_delete_rejected_self" on public.business_claims;
create policy "claims_delete_rejected_self"
on public.business_claims
for delete
to authenticated
using (
  auth.uid() = user_id
  and status in ('rejected', 'revoked')
);

drop policy if exists "claims_select_admin" on public.business_claims;
create policy "claims_select_admin"
on public.business_claims
for select
to authenticated
using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "claims_update_admin" on public.business_claims;
create policy "claims_update_admin"
on public.business_claims
for update
to authenticated
using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "business_overrides_public_read" on public.business_overrides;
create policy "business_overrides_public_read"
on public.business_overrides
for select
to anon, authenticated
using (true);

drop policy if exists "business_overrides_insert_owner" on public.business_overrides;
create policy "business_overrides_insert_owner"
on public.business_overrides
for insert
to authenticated
with check (
  updated_by = auth.uid()
  and
  exists (
    select 1
    from public.business_claims bc
    where bc.business_id = business_overrides.business_id
      and bc.user_id = auth.uid()
      and bc.status = 'approved'
  )
);

drop policy if exists "business_overrides_update_owner" on public.business_overrides;
create policy "business_overrides_update_owner"
on public.business_overrides
for update
to authenticated
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
  updated_by = auth.uid()
  and
  exists (
    select 1
    from public.business_claims bc
    where bc.business_id = business_overrides.business_id
      and bc.user_id = auth.uid()
      and bc.status = 'approved'
  )
);

drop policy if exists "business_overrides_delete_owner" on public.business_overrides;
create policy "business_overrides_delete_owner"
on public.business_overrides
for delete
to authenticated
using (
  exists (
    select 1
    from public.business_claims bc
    where bc.business_id = business_overrides.business_id
      and bc.user_id = auth.uid()
      and bc.status = 'approved'
  )
);

create or replace function public.submit_business_claim(
  p_business_id text,
  p_claimant_name text,
  p_claimant_email text,
  p_claimant_phone text default null,
  p_relationship_to_business text,
  p_message text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_claim_id uuid;
  v_constraint_name text;
begin
  if v_user_id is null then
    raise exception using
      sqlstate = 'P0001',
      message = 'Not authenticated';
  end if;

  if exists (
    select 1
    from public.business_claims
    where user_id = v_user_id
      and business_id = p_business_id
      and status = 'pending'
  ) then
    raise exception using
      sqlstate = 'P1001',
      message = 'You already have a pending claim for this business.';
  end if;

  if exists (
    select 1
    from public.business_claims
    where user_id = v_user_id
      and business_id = p_business_id
      and status = 'approved'
  ) then
    raise exception using
      sqlstate = 'P1002',
      message = 'You already have an approved claim for this business.';
  end if;

  if exists (
    select 1
    from public.business_claims
    where business_id = p_business_id
      and status = 'approved'
      and user_id <> v_user_id
  ) then
    raise exception using
      sqlstate = 'P1003',
      message = 'This business has already been claimed by another user.';
  end if;

  delete from public.business_claims
  where user_id = v_user_id
    and business_id = p_business_id
    and status in ('rejected', 'revoked');

  begin
    insert into public.business_claims (
      user_id,
      business_id,
      claimant_name,
      claimant_email,
      claimant_phone,
      relationship_to_business,
      message
    )
    values (
      v_user_id,
      p_business_id,
      p_claimant_name,
      p_claimant_email,
      p_claimant_phone,
      p_relationship_to_business,
      p_message
    )
    returning id into v_claim_id;
  exception
    when unique_violation then
      get stacked diagnostics v_constraint_name = constraint_name;

      if v_constraint_name = 'business_claims_one_pending_per_user_business_idx' then
        raise exception using
          sqlstate = 'P1001',
          message = 'You already have a pending claim for this business.';
      elsif v_constraint_name = 'business_claims_one_approved_per_business_idx' then
        raise exception using
          sqlstate = 'P1003',
          message = 'This business has already been claimed by another user.';
      else
        raise exception using
          sqlstate = 'P1004',
          message = 'A claim was submitted at the same time. Please refresh and try again.';
      end if;
  end;

  return v_claim_id;
end;
$$;

grant execute on function public.submit_business_claim(
  text,
  text,
  text,
  text,
  text,
  text
) to authenticated;

create or replace function public.delete_user_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Ensure the user is authenticated
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- Delete the user from auth.users. 
  -- Due to foreign key cascades, this will also delete their profile and claims.
  delete from auth.users where id = auth.uid();
end;
$$;

create or replace function public.review_business_claim(
  p_claim_id uuid,
  p_status text,
  p_rejection_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception using
      sqlstate = 'P1010',
      message = 'Not authorized';
  end if;

  if p_status not in ('approved', 'rejected') then
    raise exception using
      sqlstate = 'P1011',
      message = 'Invalid status';
  end if;

  if p_status = 'rejected'
     and nullif(btrim(coalesce(p_rejection_reason, '')), '') is null then
    raise exception using
      sqlstate = 'P1012',
      message = 'Rejection reason required';
  end if;

  update public.business_claims
  set status = p_status,
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      rejection_reason = case
        when p_status = 'rejected' then p_rejection_reason
        else null
      end
  where id = p_claim_id
    and status = 'pending';

  if not found then
    raise exception using
      sqlstate = 'P1013',
      message = 'Claim not found or no longer pending';
  end if;
end;
$$;

create or replace view public.verified_businesses as
select distinct business_id
from public.business_claims
where status = 'approved';

grant select on public.verified_businesses to anon, authenticated;

create table if not exists public.gmaps_scrape_runs (
  id uuid primary key default gen_random_uuid(),
  city_id text references public.cities (id) on delete set null,
  query_hash text not null,
  query_file text,
  result_file text,
  scraper_version text not null default 'gosom/google-maps-scraper',
  status text not null default 'running' check (status in ('running', 'staged', 'imported', 'skipped', 'failed')),
  query_count integer not null default 0,
  raw_count integer not null default 0,
  deduped_count integer not null default 0,
  normalized_count integer not null default 0,
  matched_count integer not null default 0,
  created_count integer not null default 0,
  updated_count integer not null default 0,
  skipped_count integer not null default 0,
  error_count integer not null default 0,
  error_text text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gmaps_scrape_runs_city_idx on public.gmaps_scrape_runs (city_id);
create index if not exists gmaps_scrape_runs_query_hash_idx on public.gmaps_scrape_runs (query_hash);
create index if not exists gmaps_scrape_runs_status_idx on public.gmaps_scrape_runs (status);

drop trigger if exists gmaps_scrape_runs_set_updated_at on public.gmaps_scrape_runs;
create trigger gmaps_scrape_runs_set_updated_at
before update on public.gmaps_scrape_runs
for each row
execute function public.set_updated_at();

create table if not exists public.gmaps_raw_places (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.gmaps_scrape_runs (id) on delete cascade,
  dedupe_key text not null,
  query_hash text not null,
  source_file text,
  place_id text,
  cid text,
  city_id text references public.cities (id) on delete set null,
  inferred_category_id text references public.categories (id) on delete set null,
  title text,
  address text,
  web_site text,
  phone text,
  review_count integer,
  review_rating numeric(3, 2),
  latitude double precision,
  longitude double precision,
  payload jsonb not null,
  scraped_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists gmaps_raw_places_run_dedupe_key_unique
  on public.gmaps_raw_places (run_id, dedupe_key);
create index if not exists gmaps_raw_places_query_hash_idx on public.gmaps_raw_places (query_hash);
create index if not exists gmaps_raw_places_place_id_idx on public.gmaps_raw_places (place_id);
create index if not exists gmaps_raw_places_cid_idx on public.gmaps_raw_places (cid);
create index if not exists gmaps_raw_places_city_id_idx on public.gmaps_raw_places (city_id);

create unique index if not exists businesses_source_place_id_unique_idx
  on public.businesses ((source->>'placeId'))
  where source->>'placeId' is not null and source->>'placeId' <> '';

create unique index if not exists businesses_source_cid_unique_idx
  on public.businesses ((source->>'cid'))
  where source->>'cid' is not null and source->>'cid' <> '';

alter table public.gmaps_scrape_runs enable row level security;
alter table public.gmaps_raw_places enable row level security;

drop policy if exists "gmaps_scrape_runs_select_admin" on public.gmaps_scrape_runs;
create policy "gmaps_scrape_runs_select_admin"
on public.gmaps_scrape_runs
for select
to authenticated
using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "gmaps_raw_places_select_admin" on public.gmaps_raw_places;
create policy "gmaps_raw_places_select_admin"
on public.gmaps_raw_places
for select
to authenticated
using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create table if not exists public.call_requests (
  id uuid primary key default gen_random_uuid(),
  offer text not null check (offer in ('website', 'managed-growth')),
  name text not null,
  business_name text not null,
  trade text not null,
  city text not null,
  phone text not null,
  email text not null,
  website text,
  team_size text,
  primary_need text not null,
  stripe_payment_url text,
  schedule_url text,
  created_at timestamptz not null default now()
);

create index if not exists call_requests_offer_idx on public.call_requests (offer);
create index if not exists call_requests_created_at_idx on public.call_requests (created_at desc);

alter table public.call_requests enable row level security;

drop policy if exists "call_requests_insert_public" on public.call_requests;
create policy "call_requests_insert_public"
on public.call_requests
for insert
to anon, authenticated
with check (true);

drop policy if exists "call_requests_select_admin" on public.call_requests;
create policy "call_requests_select_admin"
on public.call_requests
for select
to authenticated
using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
