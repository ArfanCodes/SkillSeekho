import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
import { useMessages, useSendMessage, useMarkAsRead } from '../hooks/queries/useMessages';
import type { Profile } from '../types';

function initials(name: string | null) {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function groupByDate(messages: { created_at: string }[]) {
  const groups: { label: string; date: string }[] = [];
  const seen = new Set<string>();
  for (const m of messages) {
    const d = new Date(m.created_at).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
    if (!seen.has(d)) { seen.add(d); groups.push({ label: d, date: m.created_at }); }
  }
  return groups;
}

interface Props {
  conversationId: string;
  currentUserId: string;
  otherParticipant: Pick<Profile, 'id' | 'name' | 'avatar_url'>;
  onBack: () => void;
}

export default function ChatWindow({ conversationId, currentUserId, otherParticipant, onBack }: Props) {
  const { data: messages = [] } = useMessages(conversationId);
  const { mutateAsync: send, isPending: sending } = useSendMessage();
  const { mutate: markRead } = useMarkAsRead();
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Mark messages as read when window opens / new messages arrive
  useEffect(() => {
    if (conversationId && currentUserId) {
      markRead({ conversationId, userId: currentUserId });
    }
  }, [conversationId, currentUserId, messages.length, markRead]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const dateGroups = groupByDate(messages);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setText('');
    await send({ conversationId, senderId: currentUserId, content: trimmed });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      className="fixed inset-0 bg-white flex flex-col z-50"
      style={{ maxWidth: 640, margin: '0 auto' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: '#F3F4F6' }}
      >
        <button onClick={onBack} className="text-gray-500 hover:text-gray-800 p-1">
          <ArrowLeft size={20} />
        </button>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
        >
          {initials(otherParticipant.name)}
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">{otherParticipant.name ?? 'Unknown'}</p>
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-12">
            Say hello to get the conversation started.
          </p>
        )}

        {messages.map((msg, i) => {
          const isMine = msg.sender_id === currentUserId;
          // Show date separator if this message is the first of its date
          const dateLabel = dateGroups.find((g) => g.date === msg.created_at)?.label;
          const showDate = i === 0 || new Date(msg.created_at).toDateString() !== new Date(messages[i - 1].created_at).toDateString();

          return (
            <div key={msg.id}>
              {showDate && (
                <p className="text-center text-xs text-gray-400 my-3">
                  {new Date(msg.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
              <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
                <div
                  className="max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
                  style={
                    isMine
                      ? { background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: '#fff', borderBottomRightRadius: 4 }
                      : { background: '#F3F4F6', color: '#111827', borderBottomLeftRadius: 4 }
                  }
                >
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="flex items-end gap-2 px-4 py-3 border-t"
        style={{ borderColor: '#F3F4F6' }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          rows={1}
          className="flex-1 resize-none text-sm rounded-xl px-3 py-2.5 outline-none"
          style={{ border: '1px solid #E5E7EB', maxHeight: 120 }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 disabled:opacity-40 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
        >
          <Send size={16} />
        </button>
      </div>
    </motion.div>
  );
}
