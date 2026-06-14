import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';
import { useMessages, useSendMessage, useMarkAsRead } from '../hooks/queries/useMessages';
import type { Profile } from '../types';

function initials(name: string | null) {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function msgTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function dateSeparatorLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (conversationId && currentUserId) {
      markRead({ conversationId, userId: currentUserId });
    }
  }, [conversationId, currentUserId, messages.length, markRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [text]);

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
      className="fixed inset-0 flex flex-col z-50"
      style={{ maxWidth: 640, margin: '0 auto', backgroundColor: '#F7F8FA' }}>

      {/* ── Header ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{
          background: 'linear-gradient(135deg, #22C55E, #16A34A)',
          paddingTop: 'max(12px, env(safe-area-inset-top, 12px))',
        }}>
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white active:bg-white/20 transition-colors flex-shrink-0">
          <ArrowLeft size={20} />
        </button>

        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-white/25">
          {initials(otherParticipant.name)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-white leading-tight truncate">
            {otherParticipant.name ?? 'Unknown'}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-200 animate-pulse" />
            <p className="text-[11px] text-green-100">Online</p>
          </div>
        </div>
      </div>

      {/* ── Message list ── */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(34,197,94,0.04) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}>
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center h-full py-20 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: '1px solid #BBF7D0' }}>
              <MessageCircle size={28} className="text-green-400" strokeWidth={1.5} />
            </div>
            <p className="font-semibold text-gray-600 text-sm mb-1">Start the conversation</p>
            <p className="text-xs text-gray-400">Say hello to {otherParticipant.name?.split(' ')[0] ?? 'them'} 👋</p>
          </motion.div>
        )}

        <div className="space-y-1">
          {messages.map((msg, i) => {
            const isMine = msg.sender_id === currentUserId;
            const showDate = i === 0 || new Date(msg.created_at).toDateString() !== new Date(messages[i - 1].created_at).toDateString();
            const prevIsMine = i > 0 && messages[i - 1].sender_id === currentUserId;
            const isGrouped = !showDate && isMine === prevIsMine;

            return (
              <div key={msg.id}>
                {/* Date separator */}
                {showDate && (
                  <div className="flex items-center justify-center my-4">
                    <span
                      className="text-[11px] font-medium text-gray-500 px-3 py-1 rounded-full"
                      style={{ backgroundColor: 'rgba(255,255,255,0.85)', border: '1px solid #E5E7EB' }}>
                      {dateSeparatorLabel(msg.created_at)}
                    </span>
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-0.5' : 'mt-2'}`}>

                  <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[78%]`}>
                    <div
                      className="px-3.5 py-2.5 text-sm leading-relaxed"
                      style={{
                        ...(isMine
                          ? {
                              background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                              color: '#fff',
                              borderRadius: isGrouped ? '18px 4px 18px 18px' : '18px 4px 18px 18px',
                              borderBottomRightRadius: 4,
                            }
                          : {
                              backgroundColor: '#fff',
                              color: '#111827',
                              borderRadius: '4px 18px 18px 18px',
                              borderBottomLeftRadius: isGrouped ? 18 : 4,
                              border: '1px solid #F3F4F6',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                            }),
                      }}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-0.5 mx-1">
                      {msgTime(msg.created_at)}
                    </span>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div
        className="flex items-end gap-2 px-4 py-3 flex-shrink-0"
        style={{
          backgroundColor: '#fff',
          borderTop: '1px solid #F3F4F6',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.04)',
        }}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          rows={1}
          className="flex-1 resize-none text-sm outline-none px-4 py-2.5 leading-relaxed"
          style={{
            border: '1.5px solid #E5E7EB',
            borderRadius: 20,
            maxHeight: 120,
            backgroundColor: '#F7F8FA',
            transition: 'border-color 0.15s',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#22C55E'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; }}
        />
        <motion.button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          whileTap={{ scale: 0.88 }}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 disabled:opacity-40"
          style={{
            background: 'linear-gradient(135deg, #22C55E, #16A34A)',
            boxShadow: text.trim() ? '0 4px 12px rgba(34,197,94,0.35)' : 'none',
            transition: 'box-shadow 0.2s, opacity 0.2s',
          }}>
          {sending
            ? <motion.div
                className="w-4 h-4 rounded-full border-2 border-white border-t-transparent"
                animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }} />
            : <Send size={16} />}
        </motion.button>
      </div>
    </motion.div>
  );
}
