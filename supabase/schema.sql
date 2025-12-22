-- SaintSal Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'starter', 'pro', 'teams', 'enterprise')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  queries_used integer default 0,
  property_scores_used integer default 0,
  referral_code text unique,
  referred_by text,
  affiliate_status text default 'none' check (affiliate_status in ('none', 'junior', 'vp')),
  stripe_connect_id text unique,
  total_earnings numeric(10,2) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Conversations table
create table if not exists public.conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  model text default 'gpt-4',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Messages table
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  model text,
  tokens_used integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Property scores table
create table if not exists public.property_scores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  address text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  property_type text not null,
  purchase_price numeric(12,2) not null,
  arv numeric(12,2),
  repair_cost numeric(12,2),
  rent_estimate numeric(10,2),
  overall_score integer default 0,
  cash_flow_score integer default 0,
  appreciation_score integer default 0,
  risk_score integer default 0,
  ai_analysis jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Deals table
create table if not exists public.deals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  property_address text not null,
  deal_type text not null check (deal_type in ('purchase', 'refinance', 'construction')),
  loan_amount numeric(12,2) not null,
  status text default 'lead' check (status in ('lead', 'application', 'processing', 'underwriting', 'approved', 'funded', 'closed', 'lost')),
  borrower_name text not null,
  borrower_email text not null,
  borrower_phone text,
  notes text,
  ghl_contact_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Affiliate referrals table
create table if not exists public.affiliate_referrals (
  id uuid default uuid_generate_v4() primary key,
  affiliate_id uuid references public.profiles(id) on delete cascade not null,
  referred_user_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'active', 'cancelled')),
  commission_rate numeric(4,2) default 0.30,
  total_paid numeric(10,2) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(affiliate_id, referred_user_id)
);

-- Affiliate payouts table
create table if not exists public.affiliate_payouts (
  id uuid default uuid_generate_v4() primary key,
  affiliate_id uuid references public.profiles(id) on delete cascade not null,
  amount numeric(10,2) not null,
  stripe_transfer_id text,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index if not exists idx_conversations_user_id on public.conversations(user_id);
create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
create index if not exists idx_property_scores_user_id on public.property_scores(user_id);
create index if not exists idx_deals_user_id on public.deals(user_id);
create index if not exists idx_deals_status on public.deals(status);
create index if not exists idx_affiliate_referrals_affiliate_id on public.affiliate_referrals(affiliate_id);
create index if not exists idx_affiliate_payouts_affiliate_id on public.affiliate_payouts(affiliate_id);
create index if not exists idx_profiles_referral_code on public.profiles(referral_code);

-- Row Level Security Policies

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.property_scores enable row level security;
alter table public.deals enable row level security;
alter table public.affiliate_referrals enable row level security;
alter table public.affiliate_payouts enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Conversations policies
create policy "Users can view own conversations"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "Users can create conversations"
  on public.conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on public.conversations for update
  using (auth.uid() = user_id);

create policy "Users can delete own conversations"
  on public.conversations for delete
  using (auth.uid() = user_id);

-- Messages policies
create policy "Users can view messages in own conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

create policy "Users can create messages in own conversations"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

-- Property scores policies
create policy "Users can view own property scores"
  on public.property_scores for select
  using (auth.uid() = user_id);

create policy "Users can create property scores"
  on public.property_scores for insert
  with check (auth.uid() = user_id);

-- Deals policies
create policy "Users can view own deals"
  on public.deals for select
  using (auth.uid() = user_id);

create policy "Users can create deals"
  on public.deals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own deals"
  on public.deals for update
  using (auth.uid() = user_id);

create policy "Users can delete own deals"
  on public.deals for delete
  using (auth.uid() = user_id);

-- Affiliate referrals policies
create policy "Affiliates can view own referrals"
  on public.affiliate_referrals for select
  using (auth.uid() = affiliate_id);

-- Affiliate payouts policies
create policy "Affiliates can view own payouts"
  on public.affiliate_payouts for select
  using (auth.uid() = affiliate_id);

-- Functions

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, referred_by)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'referred_by'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to reset monthly usage
create or replace function public.reset_monthly_usage()
returns void as $$
begin
  update public.profiles
  set queries_used = 0, property_scores_used = 0;
end;
$$ language plpgsql security definer;

-- Function to increment affiliate earnings
create or replace function public.increment_affiliate_earnings(affiliate_id uuid, amount numeric)
returns void as $$
begin
  update public.profiles
  set total_earnings = total_earnings + amount
  where id = affiliate_id;
end;
$$ language plpgsql security definer;

-- Function to update VP status based on referral count
create or replace function public.check_vp_status()
returns trigger as $$
declare
  referral_count integer;
begin
  select count(*) into referral_count
  from public.affiliate_referrals
  where affiliate_id = new.affiliate_id
  and status = 'active';

  if referral_count >= 10 then
    update public.profiles
    set affiliate_status = 'vp'
    where id = new.affiliate_id
    and affiliate_status = 'junior';
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger to check VP status on referral update
drop trigger if exists check_vp_status_trigger on public.affiliate_referrals;
create trigger check_vp_status_trigger
  after insert or update on public.affiliate_referrals
  for each row execute procedure public.check_vp_status();
