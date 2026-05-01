create extension if not exists pgcrypto with schema extensions;

do $$
begin
  create type public.player_color as enum ('white', 'black');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.ai_difficulty as enum ('beginner', 'intermediate', 'advanced');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.game_status as enum (
    'active',
    'checkmate',
    'stalemate',
    'draw',
    'resigned',
    'abandoned'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.move_actor as enum ('user', 'ai');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.review_severity as enum ('inaccuracy', 'mistake', 'blunder');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.blunder_category as enum (
    'Hanging Piece',
    'Missed Tactic',
    'King Safety',
    'Tunnel Vision',
    'Greedy Move',
    'Time Panic',
    'Opening Drift',
    'Endgame Technique'
  );
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  city text not null default 'Other'
    check (city in ('Almaty', 'Astana', 'Shymkent', 'Other')),
  default_difficulty public.ai_difficulty not null default 'beginner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  player_color public.player_color not null default 'white',
  ai_difficulty public.ai_difficulty not null default 'beginner',
  status public.game_status not null default 'active',
  winner public.player_color,
  initial_fen text not null,
  final_fen text,
  pgn text,
  move_count integer not null default 0 check (move_count >= 0),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table if not exists public.game_moves (
  id bigserial primary key,
  game_id uuid not null,
  user_id uuid not null,
  ply integer not null check (ply > 0),
  move_number integer not null check (move_number > 0),
  color public.player_color not null,
  actor public.move_actor not null,
  san text not null,
  uci text not null,
  from_square text not null check (from_square ~ '^[a-h][1-8]$'),
  to_square text not null check (to_square ~ '^[a-h][1-8]$'),
  promotion text check (promotion is null or promotion in ('q', 'r', 'b', 'n')),
  fen_before text not null,
  fen_after text not null,
  eval_cp integer,
  eval_mate integer,
  time_spent_ms integer check (time_spent_ms is null or time_spent_ms >= 0),
  created_at timestamptz not null default now(),
  foreign key (game_id, user_id) references public.games(id, user_id) on delete cascade,
  unique (game_id, ply)
);

create table if not exists public.game_reviews (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null unique,
  user_id uuid not null,
  summary text,
  main_category public.blunder_category,
  accuracy_score numeric(5,2) check (
    accuracy_score is null or (accuracy_score >= 0 and accuracy_score <= 100)
  ),
  blunder_count integer not null default 0 check (blunder_count >= 0),
  mistake_count integer not null default 0 check (mistake_count >= 0),
  training_goal text,
  coach_locale text not null default 'en' check (coach_locale in ('en', 'ru')),
  review_model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (game_id, user_id) references public.games(id, user_id) on delete cascade,
  unique (id, user_id)
);

create table if not exists public.critical_moments (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null,
  game_id uuid not null,
  user_id uuid not null,
  move_id bigint references public.game_moves(id) on delete set null,
  ply integer not null check (ply > 0),
  move_number integer not null check (move_number > 0),
  category public.blunder_category not null,
  severity public.review_severity not null,
  user_move text not null,
  best_move text not null,
  eval_before_cp integer,
  eval_after_cp integer,
  eval_drop_cp integer,
  fen_before text not null,
  fen_after text not null,
  explanation text,
  training_hint text,
  created_at timestamptz not null default now(),
  foreign key (review_id, user_id) references public.game_reviews(id, user_id) on delete cascade,
  foreign key (game_id, user_id) references public.games(id, user_id) on delete cascade
);

create table if not exists public.daily_review_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null default ((now() at time zone 'utc')::date),
  reviews_used integer not null default 0 check (reviews_used >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date)
);

create table if not exists public.leaderboard_snapshots (
  id uuid primary key default gen_random_uuid(),
  city text not null check (city in ('Almaty', 'Astana', 'Shymkent', 'Other')),
  period_start date not null,
  period_end date not null,
  snapshot jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (city, period_start, period_end),
  check (period_end >= period_start)
);

create index if not exists profiles_city_idx on public.profiles(city);
create index if not exists games_user_id_created_at_idx on public.games(user_id, created_at desc);
create index if not exists games_user_id_status_idx on public.games(user_id, status);
create index if not exists game_moves_game_id_ply_idx on public.game_moves(game_id, ply);
create index if not exists game_reviews_user_id_created_at_idx
  on public.game_reviews(user_id, created_at desc);
create index if not exists critical_moments_user_id_category_idx
  on public.critical_moments(user_id, category);
create index if not exists daily_review_usage_date_idx
  on public.daily_review_usage(usage_date);
create index if not exists leaderboard_snapshots_city_period_idx
  on public.leaderboard_snapshots(city, period_start desc, period_end desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists games_set_updated_at on public.games;
create trigger games_set_updated_at
before update on public.games
for each row execute function public.set_updated_at();

drop trigger if exists game_reviews_set_updated_at on public.game_reviews;
create trigger game_reviews_set_updated_at
before update on public.game_reviews
for each row execute function public.set_updated_at();

drop trigger if exists daily_review_usage_set_updated_at on public.daily_review_usage;
create trigger daily_review_usage_set_updated_at
before update on public.daily_review_usage
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.game_moves enable row level security;
alter table public.game_reviews enable row level security;
alter table public.critical_moments enable row level security;
alter table public.daily_review_usage enable row level security;
alter table public.leaderboard_snapshots enable row level security;

create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "games_select_own"
on public.games for select
using (auth.uid() = user_id);

create policy "games_insert_own"
on public.games for insert
with check (auth.uid() = user_id);

create policy "games_update_own"
on public.games for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "game_moves_select_own"
on public.game_moves for select
using (auth.uid() = user_id);

create policy "game_moves_insert_own"
on public.game_moves for insert
with check (auth.uid() = user_id);

create policy "game_reviews_select_own"
on public.game_reviews for select
using (auth.uid() = user_id);

create policy "game_reviews_insert_own"
on public.game_reviews for insert
with check (auth.uid() = user_id);

create policy "game_reviews_update_own"
on public.game_reviews for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "critical_moments_select_own"
on public.critical_moments for select
using (auth.uid() = user_id);

create policy "critical_moments_insert_own"
on public.critical_moments for insert
with check (auth.uid() = user_id);

create policy "daily_review_usage_select_own"
on public.daily_review_usage for select
using (auth.uid() = user_id);

create policy "daily_review_usage_insert_own"
on public.daily_review_usage for insert
with check (auth.uid() = user_id);

create policy "daily_review_usage_update_own"
on public.daily_review_usage for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "leaderboard_snapshots_select_public"
on public.leaderboard_snapshots for select
using (true);
