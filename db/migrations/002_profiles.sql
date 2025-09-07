-- 002: Create profiles table and indexes
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  username text NOT NULL,
  avatar_url text,
  bio text,
  wallet_address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles
  ADD CONSTRAINT fk_profiles_user FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX uq_profiles_email ON public.profiles (email);
CREATE UNIQUE INDEX uq_profiles_username ON public.profiles (username);
CREATE INDEX idx_profiles_wallet ON public.profiles (wallet_address);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles: select by owner" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles: update by owner" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles: insert for authenticated" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
