-- =============================================
-- Voting App Schema
-- Run this in your Supabase SQL editor
-- =============================================

-- Elections
create table elections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text not null default 'setup' check (status in ('setup', 'voting', 'closed')),
  created_at timestamptz default now()
);

-- Positions within an election
create table positions (
  id uuid primary key default gen_random_uuid(),
  election_id uuid references elections(id) on delete cascade not null,
  title text not null,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

-- Nominees for each position
create table nominees (
  id uuid primary key default gen_random_uuid(),
  position_id uuid references positions(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now()
);

-- Single-use voter tokens (one per expected voter)
create table voter_tokens (
  id uuid primary key default gen_random_uuid(),
  election_id uuid references elections(id) on delete cascade not null,
  token text unique not null,
  used boolean not null default false,
  used_at timestamptz,
  created_at timestamptz default now()
);

-- Individual votes cast
create table votes (
  id uuid primary key default gen_random_uuid(),
  token_id uuid references voter_tokens(id) not null,
  election_id uuid references elections(id) not null,
  position_id uuid references positions(id) not null,
  nominee_id uuid references nominees(id) not null,
  submitted_at timestamptz default now()
);

-- =============================================
-- Atomic ballot submission RPC
-- Validates token + marks used + inserts votes
-- in a single transaction to prevent race conditions
-- =============================================
create or replace function submit_ballot(
  p_token text,
  p_selections jsonb
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_token voter_tokens%rowtype;
  v_sel jsonb;
begin
  -- Lock the token row to prevent concurrent submissions
  select * into v_token
  from voter_tokens
  where token = p_token
  for update nowait;

  if not found then
    return jsonb_build_object('success', false, 'error', 'invalid_token');
  end if;

  if v_token.used then
    return jsonb_build_object('success', false, 'error', 'token_used');
  end if;

  -- Mark token as used
  update voter_tokens
  set used = true, used_at = now()
  where id = v_token.id;

  -- Insert one vote per position selection
  for v_sel in select * from jsonb_array_elements(p_selections)
  loop
    insert into votes (token_id, election_id, position_id, nominee_id)
    values (
      v_token.id,
      v_token.election_id,
      (v_sel->>'position_id')::uuid,
      (v_sel->>'nominee_id')::uuid
    );
  end loop;

  return jsonb_build_object('success', true);
exception
  when lock_not_available then
    return jsonb_build_object('success', false, 'error', 'concurrent_request');
end;
$$;

-- =============================================
-- Enable Realtime for live results
-- Run these in the Supabase dashboard under
-- Database > Replication > Supabase Realtime
-- OR run these SQL commands:
-- =============================================
-- alter publication supabase_realtime add table votes;
-- alter publication supabase_realtime add table voter_tokens;

-- =============================================
-- Disable RLS (single-admin internal tool)
-- The security model relies on:
--   1. Admin PIN for admin routes
--   2. Single-use tokens for voter access
--   3. RPC security definer for vote submission
-- =============================================
alter table elections disable row level security;
alter table positions disable row level security;
alter table nominees disable row level security;
alter table voter_tokens disable row level security;
alter table votes disable row level security;
