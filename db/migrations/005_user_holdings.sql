-- 005: Create user_holdings table
CREATE TABLE public.user_holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token_symbol text NOT NULL,
  token_name text NOT NULL,
  balance numeric NOT NULL,
  contract_address text NOT NULL,
  last_updated timestamptz DEFAULT now()
);

ALTER TABLE public.user_holdings
  ADD CONSTRAINT fk_user_holdings_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX uq_user_holdings_user_contract ON public.user_holdings (user_id, contract_address);

ALTER TABLE public.user_holdings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "holdings: insert own" ON public.user_holdings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "holdings: select own" ON public.user_holdings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "holdings: update own" ON public.user_holdings FOR UPDATE USING (auth.uid() = user_id);
