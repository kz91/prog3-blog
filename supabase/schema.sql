-- Reset Database
drop table if exists public.posts;
drop table if exists public.categories;
drop table if exists public.users;

-- Create the 'categories' table
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default now() not null
);

-- Create custom 'users' table (Simple Auth)
create table public.users (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  password text not null, -- Storing directly as requested (or simple hash if preferred, but user said "direct")
  name text,
  role text default 'user',
  created_at timestamp with time zone default now() not null
);

-- Create the 'posts' table
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  thumbnail_url text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  published boolean default true not null,
  scheduled_at timestamp with time zone,
  cw text,
  attachments text[] default '{}'::text[],
  poll jsonb,
  category_id uuid references public.categories(id) on delete set null,
  author_id uuid references public.users(id) on delete set null
);

-- Disable RLS for simplicity in this Custom Auth mode
-- (Since we aren't using Supabase Auth tokens, standard RLS won't work easily)
alter table public.categories disable row level security;
alter table public.posts disable row level security;
alter table public.users disable row level security;
