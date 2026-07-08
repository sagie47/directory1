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
  evidence_urls text[] not null default '{}',
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  notification_status text not null default 'pending' constraint business_claims_notification_status_check check (notification_status in ('pending', 'sending', 'sent', 'failed', 'skipped')),
  notification_retry_count integer not null default 0 constraint business_claims_notification_retry_count_check check (notification_retry_count >= 0),
  notification_last_attempt_at timestamptz,
  notification_last_success_at timestamptz,
  notification_last_failure_at timestamptz,
  notification_last_error_code text,
  notification_last_error text,
  notification_last_http_status integer,
  notification_last_response_body text,
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

create table if not exists public.classifieds (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('job', 'worker')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'archived')),
  title text not null,
  description text not null,
  city_id text not null references public.cities (id),
  category_id text references public.categories (id),
  duration_type text not null check (duration_type in ('on_demand', 'short_term', 'full_time')),
  organization_name text,
  compensation_label text,
  start_date date,
  end_date date,
  contact_name text not null,
  contact_email text,
  contact_phone text,
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  rejection_reason text,
  expires_at timestamptz not null default now() + interval '45 days',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint classifieds_contact_method_check check (
    nullif(btrim(coalesce(contact_email, '')), '') is not null
    or nullif(btrim(coalesce(contact_phone, '')), '') is not null
  ),
  constraint classifieds_date_range_check check (
    start_date is null
    or end_date is null
    or end_date >= start_date
  )
);

alter table public.business_overrides add column if not exists name text;
alter table public.business_claims add column if not exists evidence_urls text[] not null default '{}';
alter table public.business_claims add column if not exists notification_status text not null default 'pending';
alter table public.business_claims add column if not exists notification_retry_count integer not null default 0;
alter table public.business_claims add column if not exists notification_last_attempt_at timestamptz;
alter table public.business_claims add column if not exists notification_last_success_at timestamptz;
alter table public.business_claims add column if not exists notification_last_failure_at timestamptz;
alter table public.business_claims add column if not exists notification_last_error_code text;
alter table public.business_claims add column if not exists notification_last_error text;
alter table public.business_claims add column if not exists notification_last_http_status integer;
alter table public.business_claims add column if not exists notification_last_response_body text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'business_claims_notification_status_check'
  ) then
    alter table public.business_claims
      add constraint business_claims_notification_status_check
      check (notification_status in ('pending', 'sending', 'sent', 'failed', 'skipped'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'business_claims_notification_retry_count_check'
  ) then
    alter table public.business_claims
      add constraint business_claims_notification_retry_count_check
      check (notification_retry_count >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'classifieds_date_range_check'
  ) then
    alter table public.classifieds
      add constraint classifieds_date_range_check
      check (
        start_date is null
        or end_date is null
        or end_date >= start_date
      );
  end if;
end
$$;

update public.business_claims
set notification_status = case
  when notification_sent_at is not null then 'sent'
  when notification_last_error is not null then 'failed'
  else notification_status
end
where notification_status = 'pending';

create index if not exists business_claims_user_id_idx on public.business_claims (user_id);
create index if not exists business_claims_business_id_idx on public.business_claims (business_id);
create index if not exists business_claims_notification_status_idx on public.business_claims (notification_status);

create index if not exists classifieds_status_idx on public.classifieds (status);
create index if not exists classifieds_kind_idx on public.classifieds (kind);
create index if not exists classifieds_city_id_idx on public.classifieds (city_id);
create index if not exists classifieds_category_id_idx on public.classifieds (category_id);
create index if not exists classifieds_duration_type_idx on public.classifieds (duration_type);
create index if not exists classifieds_created_at_idx on public.classifieds (created_at desc);
create index if not exists classifieds_public_jobs_idx
  on public.classifieds (status, expires_at, created_at desc)
  where kind = 'job';

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

drop trigger if exists classifieds_set_updated_at on public.classifieds;
create trigger classifieds_set_updated_at
before update on public.classifieds
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
alter table public.classifieds enable row level security;

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

drop policy if exists "classifieds_select_public_approved" on public.classifieds;
create policy "classifieds_select_public_approved"
on public.classifieds
for select
to anon, authenticated
using (status = 'approved' and expires_at > now());

drop policy if exists "classifieds_insert_public_pending" on public.classifieds;
create policy "classifieds_insert_public_pending"
on public.classifieds
for insert
to anon, authenticated
with check (
  kind = 'job'
  and status = 'pending'
  and reviewed_by is null
  and reviewed_at is null
  and rejection_reason is null
  and expires_at > now()
  and (
    nullif(btrim(coalesce(contact_email, '')), '') is not null
    or nullif(btrim(coalesce(contact_phone, '')), '') is not null
  )
);

drop policy if exists "classifieds_select_admin" on public.classifieds;
create policy "classifieds_select_admin"
on public.classifieds
for select
to authenticated
using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "classifieds_update_admin" on public.classifieds;
create policy "classifieds_update_admin"
on public.classifieds
for update
to authenticated
using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create or replace function public.submit_business_claim(
  p_business_id text,
  p_claimant_name text,
  p_claimant_email text,
  p_claimant_phone text default null,
  p_relationship_to_business text default null,
  p_message text default null,
  p_evidence_urls text[] default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_claim_id uuid;
  v_claimant_email text;
  v_constraint_name text;
begin
  if v_user_id is null then
    raise exception using
      sqlstate = 'P0001',
      message = 'Not authenticated';
  end if;

  if nullif(btrim(p_relationship_to_business), '') is null then
    raise exception using
      sqlstate = 'P0001',
      message = 'Relationship to business is required';
  end if;

  v_claimant_email := nullif(btrim(p_claimant_email), '');

  if v_claimant_email is null then
    select nullif(btrim(email), '')
    into v_claimant_email
    from public.profiles
    where id = v_user_id;
  end if;

  if v_claimant_email is null then
    v_claimant_email := coalesce(
      nullif(btrim(auth.jwt() ->> 'email'), ''),
      nullif(btrim(auth.jwt() -> 'user_metadata' ->> 'email'), '')
    );
  end if;

  if v_claimant_email is null then
    raise exception using
      sqlstate = 'P1005',
      message = 'Unable to determine claimant email from your account profile.';
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

  begin
    insert into public.business_claims (
      user_id,
      business_id,
      claimant_name,
      claimant_email,
      claimant_phone,
      relationship_to_business,
      message,
      evidence_urls
    )
    values (
      v_user_id,
      p_business_id,
      p_claimant_name,
      v_claimant_email,
      p_claimant_phone,
      p_relationship_to_business,
      p_message,
      coalesce(p_evidence_urls, '{}'::text[])
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
  text,
  text[]
) to authenticated;

create or replace function public.delete_user_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_time timestamptz;
  v_token_age interval;
begin
  -- Ensure the user is authenticated
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- Validate that the user has recently re-authenticated (within 5 minutes)
  -- This provides step-up verification for destructive actions
  v_auth_time := coalesce(
    case
      when nullif(auth.jwt() ->> 'auth_time', '') is not null
        then to_timestamp((auth.jwt() ->> 'auth_time')::double precision)
      else null
    end,
    case
      when nullif(auth.jwt() ->> 'iat', '') is not null
        then to_timestamp((auth.jwt() ->> 'iat')::double precision)
      else null
    end
  );

  if v_auth_time is null then
    raise exception 'Please re-authenticate before deleting your account. A fresh session is required for this action.';
  end if;

  v_token_age := now() - v_auth_time;
  
  if v_token_age > interval '5 minutes' then
    raise exception 'Please re-authenticate before deleting your account. Your session is too old for this action.';
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
      end,
      notification_status = 'pending',
      notification_retry_count = 0,
      notification_last_attempt_at = null,
      notification_last_success_at = null,
      notification_last_failure_at = null,
      notification_last_error_code = null,
      notification_last_error = null,
      notification_last_http_status = null,
      notification_last_response_body = null,
      notification_sent_at = null
  where id = p_claim_id
    and status = 'pending';

  if not found then
    raise exception using
      sqlstate = 'P1013',
      message = 'Claim not found or no longer pending';
  end if;
end;
$$;

create or replace function public.review_classified(
  p_classified_id uuid,
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
      sqlstate = 'P1020',
      message = 'Not authorized';
  end if;

  if p_status not in ('approved', 'rejected', 'archived') then
    raise exception using
      sqlstate = 'P1021',
      message = 'Invalid status';
  end if;

  if p_status = 'rejected'
     and nullif(btrim(coalesce(p_rejection_reason, '')), '') is null then
    raise exception using
      sqlstate = 'P1022',
      message = 'Rejection reason required';
  end if;

  update public.classifieds
  set status = p_status,
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      expires_at = case
        when p_status = 'approved' then now() + interval '45 days'
        else expires_at
      end,
      rejection_reason = case
        when p_status = 'rejected' then p_rejection_reason
        when p_status = 'approved' then null
        else rejection_reason
      end
  where id = p_classified_id;

  if not found then
    raise exception using
      sqlstate = 'P1023',
      message = 'Classified not found';
  end if;
end;
$$;

grant execute on function public.review_classified(
  uuid,
  text,
  text
) to authenticated;

create or replace view public.verified_businesses as
select distinct business_id
from public.business_claims
where status = 'approved';

grant select on public.verified_businesses to anon, authenticated;

create or replace view public.claim_notification_observability
with (security_invoker = true)
as
select
  bc.id as claim_id,
  bc.business_id,
  bc.status as claim_status,
  bc.notification_status,
  bc.notification_retry_count,
  bc.notification_last_attempt_at,
  bc.notification_last_success_at,
  bc.notification_last_failure_at,
  bc.notification_last_error_code,
  bc.notification_last_error,
  bc.notification_last_http_status,
  bc.notification_last_response_body,
  bc.notification_sent_at,
  (bc.status in ('approved', 'rejected') and bc.notification_status = 'failed') as needs_attention,
  (
    bc.status in ('approved', 'rejected')
    and bc.notification_sent_at is null
    and bc.notification_status in ('pending', 'failed', 'skipped')
  ) as can_retry
from public.business_claims bc;

grant select on public.claim_notification_observability to authenticated;

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
  idempotency_key uuid unique,
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

-- Direct inserts are disabled; all inserts must go through the submit-call-request edge function
-- which performs validation, rate-limiting, and sanitization before inserting.
drop policy if exists "call_requests_insert_public" on public.call_requests;

drop policy if exists "call_requests_select_admin" on public.call_requests;
create policy "call_requests_select_admin"
on public.call_requests
for select
to authenticated
using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- =====================================================================
-- Worker profiles: persistent, account-linked tradesperson profiles
-- =====================================================================

create table if not exists public.worker_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'archived')),
  display_name text not null,
  headline text not null,
  city_id text not null references public.cities (id),
  category_id text references public.categories (id),
  availability text not null check (availability in ('on_demand', 'short_term', 'full_time')),
  service_areas text[] not null default '{}',
  skills jsonb not null default '[]'::jsonb,
  rate_label text,
  years_experience integer check (years_experience is null or years_experience >= 0),
  bio text not null,
  photo_url text,
  resume_path text,
  open_to_work boolean not null default true,
  contact_name text not null,
  contact_email text,
  contact_phone text,
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint worker_profiles_contact_method_check check (
    nullif(btrim(coalesce(contact_email, '')), '') is not null
    or nullif(btrim(coalesce(contact_phone, '')), '') is not null
  )
);

create index if not exists worker_profiles_status_idx on public.worker_profiles (status);
create index if not exists worker_profiles_city_id_idx on public.worker_profiles (city_id);
create index if not exists worker_profiles_category_id_idx on public.worker_profiles (category_id);
create index if not exists worker_profiles_availability_idx on public.worker_profiles (availability);
create index if not exists worker_profiles_created_at_idx on public.worker_profiles (created_at desc);

drop trigger if exists worker_profiles_set_updated_at on public.worker_profiles;
create trigger worker_profiles_set_updated_at
before update on public.worker_profiles
for each row
execute function public.set_updated_at();

-- Force every non-admin write back into the moderation queue so a worker
-- cannot self-approve, and any edit re-enters review with cleared metadata.
create or replace function public.enforce_worker_profile_moderation()
returns trigger
language plpgsql
as $$
begin
  if exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    return new;
  end if;

  -- Allow a non-admin to flip the open_to_work visibility toggle without
  -- re-entering moderation: only force re-review when public-facing content
  -- actually changed.
  if tg_op = 'update' and not (
       new.display_name      is distinct from old.display_name
    or new.headline          is distinct from old.headline
    or new.city_id           is distinct from old.city_id
    or new.category_id       is distinct from old.category_id
    or new.availability      is distinct from old.availability
    or new.service_areas     is distinct from old.service_areas
    or new.skills            is distinct from old.skills
    or new.rate_label        is distinct from old.rate_label
    or new.years_experience  is distinct from old.years_experience
    or new.bio               is distinct from old.bio
    or new.photo_url         is distinct from old.photo_url
    or new.resume_path       is distinct from old.resume_path
    or new.contact_name      is distinct from old.contact_name
    or new.contact_email     is distinct from old.contact_email
    or new.contact_phone     is distinct from old.contact_phone
  ) then
    -- Only open_to_work (and/or system columns) changed: preserve review state.
    new.status := old.status;
    new.reviewed_by := old.reviewed_by;
    new.reviewed_at := old.reviewed_at;
    new.rejection_reason := old.rejection_reason;
    return new;
  end if;

  new.status := 'pending';
  new.reviewed_by := null;
  new.reviewed_at := null;
  new.rejection_reason := null;
  return new;
end;
$$;

drop trigger if exists worker_profiles_enforce_moderation on public.worker_profiles;
create trigger worker_profiles_enforce_moderation
before insert or update on public.worker_profiles
for each row
execute function public.enforce_worker_profile_moderation();

alter table public.worker_profiles enable row level security;

drop policy if exists "worker_profiles_select_public_approved" on public.worker_profiles;
create policy "worker_profiles_select_public_approved"
on public.worker_profiles
for select
to anon, authenticated
using (status = 'approved' and open_to_work);

drop policy if exists "worker_profiles_select_self" on public.worker_profiles;
create policy "worker_profiles_select_self"
on public.worker_profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "worker_profiles_insert_self" on public.worker_profiles;
create policy "worker_profiles_insert_self"
on public.worker_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "worker_profiles_update_self" on public.worker_profiles;
create policy "worker_profiles_update_self"
on public.worker_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "worker_profiles_select_admin" on public.worker_profiles;
create policy "worker_profiles_select_admin"
on public.worker_profiles
for select
to authenticated
using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "worker_profiles_update_admin" on public.worker_profiles;
create policy "worker_profiles_update_admin"
on public.worker_profiles
for update
to authenticated
using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create or replace function public.review_worker_profile(
  p_profile_id uuid,
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
      sqlstate = 'P1030',
      message = 'Not authorized';
  end if;

  if p_status not in ('approved', 'rejected', 'archived') then
    raise exception using
      sqlstate = 'P1031',
      message = 'Invalid status';
  end if;

  if p_status = 'rejected'
     and nullif(btrim(coalesce(p_rejection_reason, '')), '') is null then
    raise exception using
      sqlstate = 'P1032',
      message = 'Rejection reason required';
  end if;

  update public.worker_profiles
  set status = p_status,
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      rejection_reason = case
        when p_status = 'rejected' then p_rejection_reason
        when p_status = 'approved' then null
        else rejection_reason
      end
  where id = p_profile_id;

  if not found then
    raise exception using
      sqlstate = 'P1033',
      message = 'Worker profile not found';
  end if;
end;
$$;

grant execute on function public.review_worker_profile(
  uuid,
  text,
  text
) to authenticated;

-- Public storage bucket for worker profile photos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'worker-photos',
  'worker-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- Workers upload/replace/delete only inside their own {user_id}/ folder
drop policy if exists "worker_photos_upload_own" on storage.objects;
create policy "worker_photos_upload_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'worker-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "worker_photos_update_own" on storage.objects;
create policy "worker_photos_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'worker-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'worker-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "worker_photos_delete_own" on storage.objects;
create policy "worker_photos_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'worker-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Anyone can read worker photos (public bucket)
drop policy if exists "worker_photos_read_public" on storage.objects;
create policy "worker_photos_read_public"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'worker-photos');

-- =====================================================================
-- Resume onboarding: raw resume storage + extra worker_profiles columns
-- =====================================================================

alter table public.worker_profiles add column if not exists resume_path text;
alter table public.worker_profiles add column if not exists open_to_work boolean not null default true;

create index if not exists worker_profiles_open_to_work_idx on public.worker_profiles (open_to_work);

-- Private storage bucket for uploaded resumes (admin-readable for moderation)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  10485760,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

drop policy if exists "resumes_upload_own" on storage.objects;
create policy "resumes_upload_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "resumes_read_own" on storage.objects;
create policy "resumes_read_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "resumes_delete_own" on storage.objects;
create policy "resumes_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "resumes_read_admin" on storage.objects;
create policy "resumes_read_admin"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'resumes'
  and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
