-- Infinite Ponzi Glitch — Supabase schema
-- Run in Supabase SQL Editor

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  wallet_address text unique,
  twitter_id text unique,
  twitter_username text,
  twitter_name text,
  profile_image_url text,
  referral_code text unique not null,
  referred_by uuid references users(id),
  squad_id uuid,
  attention_score integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists point_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  source text not null,
  amount integer not null,
  multiplier numeric not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists quest_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  quest_id text not null,
  verified_at timestamptz not null default now(),
  unique(user_id, quest_id)
);

create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references users(id) on delete cascade,
  referee_id uuid not null unique references users(id) on delete cascade,
  credited_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists squads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null,
  leader_id uuid not null references users(id),
  created_at timestamptz not null default now()
);

alter table users add constraint fk_users_squad foreign key (squad_id) references squads(id);

create table if not exists squad_members (
  squad_id uuid not null references squads(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (squad_id, user_id)
);

create table if not exists flash_events (
  id uuid primary key default gen_random_uuid(),
  multiplier numeric not null default 3,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  active boolean not null default true
);

create table if not exists leaderboard_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_at timestamptz not null default now(),
  data jsonb not null
);

create index if not exists idx_users_wallet on users(wallet_address);
create index if not exists idx_users_twitter on users(twitter_id);
create index if not exists idx_users_score on users(attention_score desc);
create index if not exists idx_point_events_user on point_events(user_id);
