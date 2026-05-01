-- Phase 1 advisor hardening
-- Triggered by Supabase database linter after applying the core schema:
-- - 0011 function_search_path_mutable (security WARN)  → pin search_path
-- - 0003 auth_rls_initplan (performance WARN x18)      → wrap auth.uid()
--                                                        in `(select ...)`
-- - 0001 unindexed_foreign_keys (performance INFO)     → cover hot FKs
--
-- Re-runnable: every drop is `if exists`, every create is `or replace` /
-- `if not exists`. Safe on freshly applied core schema and on subsequent runs.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own"
on public.profiles for select
using ((select auth.uid()) = id);

create policy "profiles_insert_own"
on public.profiles for insert
with check ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles for update
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "games_select_own" on public.games;
drop policy if exists "games_insert_own" on public.games;
drop policy if exists "games_update_own" on public.games;

create policy "games_select_own"
on public.games for select
using ((select auth.uid()) = user_id);

create policy "games_insert_own"
on public.games for insert
with check ((select auth.uid()) = user_id);

create policy "games_update_own"
on public.games for update
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "game_moves_select_own" on public.game_moves;
drop policy if exists "game_moves_insert_own" on public.game_moves;

create policy "game_moves_select_own"
on public.game_moves for select
using ((select auth.uid()) = user_id);

create policy "game_moves_insert_own"
on public.game_moves for insert
with check ((select auth.uid()) = user_id);

drop policy if exists "game_reviews_select_own" on public.game_reviews;
drop policy if exists "game_reviews_insert_own" on public.game_reviews;
drop policy if exists "game_reviews_update_own" on public.game_reviews;

create policy "game_reviews_select_own"
on public.game_reviews for select
using ((select auth.uid()) = user_id);

create policy "game_reviews_insert_own"
on public.game_reviews for insert
with check ((select auth.uid()) = user_id);

create policy "game_reviews_update_own"
on public.game_reviews for update
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "critical_moments_select_own" on public.critical_moments;
drop policy if exists "critical_moments_insert_own" on public.critical_moments;

create policy "critical_moments_select_own"
on public.critical_moments for select
using ((select auth.uid()) = user_id);

create policy "critical_moments_insert_own"
on public.critical_moments for insert
with check ((select auth.uid()) = user_id);

drop policy if exists "daily_review_usage_select_own" on public.daily_review_usage;
drop policy if exists "daily_review_usage_insert_own" on public.daily_review_usage;
drop policy if exists "daily_review_usage_update_own" on public.daily_review_usage;

create policy "daily_review_usage_select_own"
on public.daily_review_usage for select
using ((select auth.uid()) = user_id);

create policy "daily_review_usage_insert_own"
on public.daily_review_usage for insert
with check ((select auth.uid()) = user_id);

create policy "daily_review_usage_update_own"
on public.daily_review_usage for update
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create index if not exists game_moves_user_id_idx
  on public.game_moves(user_id, game_id);

create index if not exists game_reviews_user_id_idx
  on public.game_reviews(user_id, game_id);

create index if not exists critical_moments_review_id_user_id_idx
  on public.critical_moments(review_id, user_id);

create index if not exists critical_moments_game_id_user_id_idx
  on public.critical_moments(game_id, user_id);

create index if not exists critical_moments_move_id_idx
  on public.critical_moments(move_id);
