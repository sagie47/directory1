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
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  rejection_reason text,
  notification_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_overrides (
  business_id text primary key references public.businesses (id) on delete cascade,
  description text,
  contact jsonb,
  service_areas text[],
  hours jsonb,
  photos text[],
  updated_by uuid not null references public.profiles (id),
  updated_at timestamptz not null default now()
);

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

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

create or replace view public.verified_businesses as
select distinct business_id
from public.business_claims
where status = 'approved';

grant select on public.verified_businesses to anon, authenticated;
