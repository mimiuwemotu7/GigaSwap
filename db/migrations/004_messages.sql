-- 004: Create messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  content text NOT NULL,
  role text NOT NULL,
  component_type text,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE public.messages
  ADD CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;

CREATE INDEX idx_messages_conversation_id ON public.messages (conversation_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
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
