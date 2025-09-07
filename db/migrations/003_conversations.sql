-- 003: Create conversations table
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.conversations
  ADD CONSTRAINT fk_conversations_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX idx_conversations_user_id ON public.conversations (user_id);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conversations: select by owner" ON public.conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "conversations: insert by owner" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "conversations: update by owner" ON public.conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "conversations: delete by owner" ON public.conversations FOR DELETE USING (auth.uid() = user_id);
