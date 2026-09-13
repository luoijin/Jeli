-- ============================================================
-- Jeli — Quest Journal
-- Supabase / PostgreSQL schema
-- ============================================================

create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- users (extends Supabase auth.users with app profile fields)
-- ------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Adventurer',
  avatar_emoji text not null default '🫐',
  level integer not null default 1 check (level >= 1),
  audio_volume smallint not null default 70 check (audio_volume between 0 and 100),
  audio_muted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- rewards (static catalog of collectible loot) — created before
-- tasks since tasks.reward_id references it.
-- ------------------------------------------------------------
create type public.reward_rarity as enum ('common', 'rare', 'epic');

create table if not exists public.rewards (
  id text primary key, -- e.g. 'pixel_sword'
  name text not null,
  icon text not null,
  rarity public.reward_rarity not null default 'common'
);

insert into public.rewards (id, name, icon, rarity) values
  ('pixel_sword', 'Pixel Sword', '🗡️', 'rare'),
  ('gold_crown', 'Gold Crown', '👑', 'epic'),
  ('magic_gem', 'Magic Gem', '💎', 'epic'),
  ('red_potion', 'Red Potion', '🧪', 'common'),
  ('ancient_key', 'Ancient Key', '🗝️', 'rare'),
  ('iron_shield', 'Iron Shield', '🛡️', 'common'),
  ('power_star', 'Power Star', '⭐', 'rare'),
  ('champ_cup', 'Champ Cup', '🏆', 'epic')
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- tasks (active / done / dropped quests)
-- ------------------------------------------------------------
create type public.task_status as enum ('active', 'done', 'dropped');

create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 60),
  description text not null default '' check (char_length(description) <= 200),
  status public.task_status not null default 'active',
  reward_id text references public.rewards (id),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists idx_tasks_user_status on public.tasks (user_id, status);
create index if not exists idx_tasks_resolved_at on public.tasks (resolved_at desc);

-- Enforce the 5-active-task cap at the database layer as a safety net
-- (primary enforcement happens client-side via the overflow mechanic).
create or replace function public.check_active_task_cap()
returns trigger as $$
begin
  if new.status = 'active' then
    if (
      select count(*) from public.tasks
      where user_id = new.user_id and status = 'active' and id <> new.id
    ) >= 5 then
      raise exception 'Active task cap of 5 reached for user %', new.user_id;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_check_active_task_cap
  before insert or update on public.tasks
  for each row execute function public.check_active_task_cap();

-- ------------------------------------------------------------
-- user_rewards (per-user gallery inventory / quantities)
-- ------------------------------------------------------------
create table if not exists public.user_rewards (
  user_id uuid not null references public.users (id) on delete cascade,
  reward_id text not null references public.rewards (id) on delete cascade,
  quantity integer not null default 0 check (quantity >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, reward_id)
);

-- Helper to increment (or create) a user's reward quantity atomically.
create or replace function public.grant_reward(p_user_id uuid, p_reward_id text)
returns void as $$
begin
  insert into public.user_rewards (user_id, reward_id, quantity, updated_at)
  values (p_user_id, p_reward_id, 1, now())
  on conflict (user_id, reward_id)
  do update set quantity = public.user_rewards.quantity + 1, updated_at = now();
end;
$$ language plpgsql;

-- ------------------------------------------------------------
-- Row Level Security — each user only ever sees their own rows
-- ------------------------------------------------------------
alter table public.users enable row level security;
alter table public.tasks enable row level security;
alter table public.user_rewards enable row level security;

create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can manage own tasks" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own rewards" on public.user_rewards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- rewards table is a public read-only catalog
alter table public.rewards enable row level security;
create policy "Anyone can read reward catalog" on public.rewards
  for select using (true);
