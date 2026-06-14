-- ─────────────────────────────────────────────
-- Phase 4 — Conversations & Messages (with Supabase Realtime)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.conversations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_2    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_at  timestamptz DEFAULT now(),
  created_at       timestamptz DEFAULT now(),
  -- normalise pair order so (A,B) and (B,A) never duplicate
  UNIQUE (participant_1, participant_2),
  CHECK (participant_1 < participant_2)
);

CREATE INDEX IF NOT EXISTS conversations_p1_idx ON public.conversations(participant_1);
CREATE INDEX IF NOT EXISTS conversations_p2_idx ON public.conversations(participant_2);

CREATE TABLE IF NOT EXISTS public.messages (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content          text NOT NULL,
  read             boolean NOT NULL DEFAULT false,
  created_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_conversation_idx ON public.messages(conversation_id, created_at);

-- ── Realtime: full row data needed for INSERT events ──
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add messages to the Supabase Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ── RLS — conversations ───────────────────────
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_select_participant" ON public.conversations
  FOR SELECT USING (
    auth.uid() = participant_1 OR auth.uid() = participant_2
  );

CREATE POLICY "conversations_insert_participant" ON public.conversations
  FOR INSERT WITH CHECK (
    auth.uid() = participant_1 OR auth.uid() = participant_2
  );

CREATE POLICY "conversations_update_participant" ON public.conversations
  FOR UPDATE USING (
    auth.uid() = participant_1 OR auth.uid() = participant_2
  );

-- ── RLS — messages ────────────────────────────
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select_participant" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

CREATE POLICY "messages_insert_participant" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

CREATE POLICY "messages_update_participant" ON public.messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.messages     TO authenticated;
