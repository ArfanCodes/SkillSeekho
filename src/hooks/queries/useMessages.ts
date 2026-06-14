import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  listConversations, listMessages, sendMessage, markAsRead, subscribeToMessages,
} from '../../lib/api/messages';
import type { Message } from '../../types';

export function useConversations(userId: string | undefined) {
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn:  () => listConversations(userId as string),
    enabled:  !!userId,
    staleTime: 1000 * 30,
  });
}

export function useMessages(conversationId: string | undefined) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn:  () => listMessages(conversationId as string),
    enabled:  !!conversationId,
    staleTime: 0,
  });

  useEffect(() => {
    if (!conversationId) return;
    const channel = subscribeToMessages(conversationId, (newMsg: Message) => {
      qc.setQueryData<Message[]>(['messages', conversationId], (prev) =>
        prev ? [...prev, newMsg] : [newMsg],
      );
      // Also invalidate conversation list so unread count & last_message refresh
      qc.invalidateQueries({ queryKey: ['conversations'] });
    });
    return () => { channel.unsubscribe(); };
  }, [conversationId, qc]);

  return query;
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, senderId, content }: {
      conversationId: string;
      senderId: string;
      content: string;
    }) => sendMessage(conversationId, senderId, content),
    onSuccess: (newMsg) => {
      qc.setQueryData<Message[]>(['messages', newMsg.conversation_id], (prev) =>
        prev ? [...prev, newMsg] : [newMsg],
      );
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useMarkAsRead() {
  return useMutation({
    mutationFn: ({ conversationId, userId }: { conversationId: string; userId: string }) =>
      markAsRead(conversationId, userId),
  });
}
