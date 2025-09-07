-- Initial migration for GigaSwap app schema
-- Run this in a NEW Supabase project SQL editor (Supabase-managed schemas like auth/storage exist by default)

/*
  Quick guide — how to run this migration safely

  1) Open your Supabase project, go to SQL Editor.
  2) Paste the full contents of this file and Execute.
    - The script is written to be idempotent: tables, indexes, constraints,
     policies and triggers will be created or recreated safely.
  3) Verify:
    - SELECT * FROM public.profiles LIMIT 5;
    - To verify trigger: SELECT tgname FROM pg_trigger WHERE tgname LIKE 'create_profile%';
  4) If you need to rollback a specific object, use:
    - DROP TRIGGER IF EXISTS create_profile_after_auth_user ON auth.users;
    - DROP FUNCTION IF EXISTS public.create_profile_on_auth_user();
    - ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS fk_profiles_user;
  Notes:
   - This file uses DROP ... IF EXISTS before adding constraints and policies
    to avoid errors when re-running in the same database.
*/

-- Ensure gen_random_uuid is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-------------------------
-- Application tables
-------------------------
-- profiles (id matches auth.users.id)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  username text NOT NULL,
  avatar_url text,
  bio text,
  wallet_address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- messages
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  content text NOT NULL,
  role text NOT NULL,
  component_type text,
  timestamp timestamptz DEFAULT now()
);

-- user_holdings
CREATE TABLE IF NOT EXISTS public.user_holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token_symbol text NOT NULL,
  token_name text NOT NULL,
  balance numeric NOT NULL,
  contract_address text NOT NULL,
  last_updated timestamptz DEFAULT now()
);

-- user_transactions
CREATE TABLE IF NOT EXISTS public.user_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  transaction_hash text NOT NULL,
  from_token text NOT NULL,
  to_token text NOT NULL,
  from_amount numeric NOT NULL,
  to_amount numeric NOT NULL,
  status text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-------------------------
-- Constraints & Indexes
-------------------------
-- FK constraints linking app tables to auth.users
-- Drop constraints if they already exist to make this migration re-runnable
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS fk_profiles_user;
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS fk_conversations_user;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS fk_messages_conversation;
ALTER TABLE public.user_holdings DROP CONSTRAINT IF EXISTS fk_user_holdings_user;
ALTER TABLE public.user_transactions DROP CONSTRAINT IF EXISTS fk_user_transactions_user;

-- FK constraints linking app tables to auth.users (re-create)
ALTER TABLE public.profiles
  ADD CONSTRAINT fk_profiles_user FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.conversations
  ADD CONSTRAINT fk_conversations_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.messages
  ADD CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;

ALTER TABLE public.user_holdings
  ADD CONSTRAINT fk_user_holdings_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_transactions
  ADD CONSTRAINT fk_user_transactions_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Unique constraints / indexes
CREATE UNIQUE INDEX IF NOT EXISTS uq_profiles_email ON public.profiles (email);
CREATE UNIQUE INDEX IF NOT EXISTS uq_profiles_username ON public.profiles (username);
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_holdings_user_contract ON public.user_holdings (user_id, contract_address);
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_transactions_hash ON public.user_transactions (transaction_hash);

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations (user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_wallet ON public.profiles (wallet_address);

-------------------------
-- Row-Level Security (RLS)
-------------------------
-- profiles: owner-only
-- profiles: owner-only
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- Drop policies if they exist (idempotent)
DROP POLICY IF EXISTS "profiles: select by owner" ON public.profiles;
DROP POLICY IF EXISTS "profiles: update by owner" ON public.profiles;
DROP POLICY IF EXISTS "profiles: insert for authenticated" ON public.profiles;
CREATE POLICY "profiles: select by owner" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles: update by owner" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles: insert for authenticated" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- conversations: owner-only
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "conversations: select by owner" ON public.conversations;
DROP POLICY IF EXISTS "conversations: insert by owner" ON public.conversations;
DROP POLICY IF EXISTS "conversations: update by owner" ON public.conversations;
DROP POLICY IF EXISTS "conversations: delete by owner" ON public.conversations;
CREATE POLICY "conversations: select by owner" ON public.conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "conversations: insert by owner" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "conversations: update by owner" ON public.conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "conversations: delete by owner" ON public.conversations FOR DELETE USING (auth.uid() = user_id);

-- messages: allow actions only if conversation belongs to user
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "messages: select if conversation owned" ON public.messages;
DROP POLICY IF EXISTS "messages: insert if conversation owned" ON public.messages;
DROP POLICY IF EXISTS "messages: update if conversation owned" ON public.messages;
DROP POLICY IF EXISTS "messages: delete if conversation owned" ON public.messages;
CREATE POLICY "messages: select if conversation owned" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = public.messages.conversation_id AND c.user_id = auth.uid())
);
CREATE POLICY "messages: insert if conversation owned" ON public.messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = public.messages.conversation_id AND c.user_id = auth.uid())
);
CREATE POLICY "messages: update if conversation owned" ON public.messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = public.messages.conversation_id AND c.user_id = auth.uid())
);
CREATE POLICY "messages: delete if conversation owned" ON public.messages FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = public.messages.conversation_id AND c.user_id = auth.uid())
);

-- user_holdings: owner-only
ALTER TABLE public.user_holdings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "holdings: insert own" ON public.user_holdings;
DROP POLICY IF EXISTS "holdings: select own" ON public.user_holdings;
DROP POLICY IF EXISTS "holdings: update own" ON public.user_holdings;
CREATE POLICY "holdings: insert own" ON public.user_holdings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "holdings: select own" ON public.user_holdings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "holdings: update own" ON public.user_holdings FOR UPDATE USING (auth.uid() = user_id);

-- user_transactions: owner-only
ALTER TABLE public.user_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "transactions: insert own" ON public.user_transactions;
DROP POLICY IF EXISTS "transactions: select own" ON public.user_transactions;
CREATE POLICY "transactions: insert own" ON public.user_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "transactions: select own" ON public.user_transactions FOR SELECT USING (auth.uid() = user_id);

-------------------------
-- Final housekeeping
-------------------------
-- Grant basic read privileges to anon/authenticated roles (Supabase may manage these)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- End of migration

-------------------------
-- Automatic profile creation on auth.users insert
-- Creates a profiles row for new auth users to avoid client-side race conditions
-------------------------
-- This function runs as the definer and will insert a minimal profiles row
-- when a new user is created by the auth system. It uses ON CONFLICT DO NOTHING
-- so running it multiple times is safe.
CREATE OR REPLACE FUNCTION public.create_profile_on_auth_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    -- default username: local part of the email if present
    (CASE WHEN NEW.email IS NOT NULL AND POSITION('@' IN NEW.email) > 1
      THEN SUBSTRING(NEW.email FROM 1 FOR POSITION('@' IN NEW.email) - 1)
      ELSE NULL END),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: call the function after an auth.users row is inserted
DROP TRIGGER IF EXISTS create_profile_after_auth_user ON auth.users;
CREATE TRIGGER create_profile_after_auth_user
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.create_profile_on_auth_user();
