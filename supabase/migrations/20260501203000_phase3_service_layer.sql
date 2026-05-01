-- Phase 3 service layer
-- Adds retention/service tables plus small profile fields required by
-- onboarding, settings, Daily Blunder, Pro waitlist, and leaderboard cron.

alter table public.profiles
  add column if not exists deleted_at timestamptz;

create table if not exists public.daily_blunder_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  moment_id uuid not null references public.critical_moments(id) on delete cascade,
  attempt_date date not null default ((now() at time zone 'utc')::date),
  user_move text,
  success boolean not null default false,
  revealed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, attempt_date)
);

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'pro' check (source in ('pro', 'school')),
  created_at timestamptz not null default now(),
  unique (email, source)
);

create index if not exists profiles_deleted_at_idx
  on public.profiles(deleted_at);

create index if not exists daily_blunder_attempts_user_id_date_idx
  on public.daily_blunder_attempts(user_id, attempt_date desc);

create index if not exists daily_blunder_attempts_moment_id_idx
  on public.daily_blunder_attempts(moment_id);

create index if not exists daily_blunder_attempts_completed_at_idx
  on public.daily_blunder_attempts(user_id, completed_at desc)
  where success = true;

create index if not exists waitlist_signups_created_at_idx
  on public.waitlist_signups(created_at desc);

alter table public.daily_blunder_attempts enable row level security;
alter table public.waitlist_signups enable row level security;

drop policy if exists "daily_blunder_attempts_select_own"
  on public.daily_blunder_attempts;
drop policy if exists "daily_blunder_attempts_insert_own"
  on public.daily_blunder_attempts;
drop policy if exists "daily_blunder_attempts_update_own"
  on public.daily_blunder_attempts;

create policy "daily_blunder_attempts_select_own"
on public.daily_blunder_attempts for select
using ((select auth.uid()) = user_id);

create policy "daily_blunder_attempts_insert_own"
on public.daily_blunder_attempts for insert
with check ((select auth.uid()) = user_id);

create policy "daily_blunder_attempts_update_own"
on public.daily_blunder_attempts for update
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "waitlist_signups_insert_public"
  on public.waitlist_signups;

create policy "waitlist_signups_insert_public"
on public.waitlist_signups for insert
with check (true);
