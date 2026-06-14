import { supabase } from '../supabase';
import type { Message, ConversationWithParticipant } from '../../types';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ── Get or create a conversation between two users ──
// Always store participant_1 < participant_2 to satisfy the UNIQUE constraint.

export async function getOrCreateConversation(
  uid1: string,
  uid2: string,
): Promise<string> {
  const [p1, p2] = uid1 < uid2 ? [uid1, uid2] : [uid2, uid1];

  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('participant_1', p1)
    .eq('participant_2', p2)
    .maybeSingle();

  if (existing) return existing.id as string;

  const { data, error } = await supabase
    .from('conversations')
    .insert({ participant_1: p1, participant_2: p2 })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

// ── List all conversations for a user, with last message preview ──

export async function listConversations(userId: string): Promise<ConversationWithParticipant[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id, participant_1, participant_2, last_message_at, created_at,
      messages(content, read, sender_id, created_at)
    `)
    .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
    .order('last_message_at', { ascending: false });

  if (error) throw new Error(error.message);
  if (!data) return [];

  // Fetch the other participant's profiles in one query
  const otherIds = (data as Record<string, unknown>[]).map((c) =>
    c.participant_1 === userId ? c.participant_2 : c.participant_1,
  ) as string[];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, avatar_url')
    .in('id', [...new Set(otherIds)]);

  const profileMap = new Map(
    (profiles ?? []).map((p: { id: string; name: string | null; avatar_url: string | null }) => [p.id, p]),
  );

  return (data as Record<string, unknown>[]).map((c) => {
    const otherId = (c.participant_1 === userId ? c.participant_2 : c.participant_1) as string;
    const other = profileMap.get(otherId);
    const msgs = (c.messages ?? []) as Array<{ content: string; read: boolean; sender_id: string; created_at: string }>;
    const sorted = [...msgs].sort((a, b) => a.created_at.localeCompare(b.created_at));
    const lastMsg = sorted[sorted.length - 1];
    const unreadCount = msgs.filter((m) => !m.read && m.sender_id !== userId).length;

    return {
      id:              c.id as string,
      participant_1:   c.participant_1 as string,
      participant_2:   c.participant_2 as string,
      last_message_at: c.last_message_at as string,
      created_at:      c.created_at as string,
      other_participant: {
        id:         otherId,
        name:       other?.name ?? null,
        avatar_url: other?.avatar_url ?? null,
      },
      last_message: lastMsg?.content ?? null,
      unread_count: unreadCount,
    } as ConversationWithParticipant;
  });
}

// ── Fetch all messages in a conversation ──────

export async function listMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Message[];
}

// ── Send a message ────────────────────────────

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
): Promise<Message> {
  const trimmed = content.trim();
  if (!trimmed) throw new Error('Message cannot be empty');

  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content: trimmed })
    .select()
    .single();
  if (error) throw new Error(error.message);

  // Update conversation timestamp (best-effort)
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);

  return data as Message;
}

// ── Mark all incoming messages as read ────────

export async function markAsRead(conversationId: string, userId: string): Promise<void> {
  await supabase
    .from('messages')
    .update({ read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .eq('read', false);
}

// ── Supabase Realtime subscription ───────────
// Returns the channel so the caller can call channel.unsubscribe() on unmount.

export function subscribeToMessages(
  conversationId: string,
  onInsert: (msg: Message) => void,
): RealtimeChannel {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event:  'INSERT',
        schema: 'public',
        table:  'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => onInsert(payload.new as Message),
    )
    .subscribe();
}
