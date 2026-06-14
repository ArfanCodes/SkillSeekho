import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageCircle, Edit3 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useConversations } from '../hooks/queries/useMessages';
import ChatWindow from '../components/ChatWindow';
import type { ConversationWithParticipant } from '../types';

function initials(name: string | null) {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function relativeTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString('en-IN', { weekday: 'short' });
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// Deterministic color per name so avatars are stable across renders
const AVATAR_COLORS = [
  ['#16A34A', '#15803D'],
  ['#2563EB', '#1D4ED8'],
  ['#9333EA', '#7E22CE'],
  ['#EA580C', '#C2410C'],
  ['#0891B2', '#0E7490'],
  ['#DB2777', '#BE185D'],
];
function avatarGradient(name: string | null) {
  if (!name) return AVATAR_COLORS[0];
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export default function Messages() {
  const { profile } = useAuth();
  const { data: conversations = [], isLoading } = useConversations(profile?.id);
  const [search, setSearch] = useState('');
  const [activeConv, setActiveConv] = useState<ConversationWithParticipant | null>(null);

  const filtered = conversations.filter((c) =>
    !search || c.other_participant.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F8FA' }}>
      {/* ── Header ── */}
      <div className="sticky top-0 z-10 px-5 pt-14 pb-4"
        style={{ backgroundColor: '#F7F8FA' }}>
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Messages
            </h1>
            {!isLoading && (
              <p className="text-xs text-gray-400 mt-0.5">
                {conversations.length === 0
                  ? 'No conversations yet'
                  : `${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}`}
              </p>
            )}
          </div>
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <Edit3 size={15} className="text-green-600" />
          </button>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl"
          style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input
            className="flex-1 text-sm outline-none placeholder-gray-400 bg-transparent"
            placeholder="Search conversations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </motion.div>
      </div>

      <div className="px-5 pb-8">
        {/* Loading skeletons */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-2xl p-4 animate-pulse"
                style={{ border: '1px solid #F3F4F6' }}>
                <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded-full w-32" />
                  <div className="h-2.5 bg-gray-100 rounded-full w-48" />
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full w-8" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center py-20 text-center px-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
              style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: '1px solid #BBF7D0' }}>
              <MessageCircle size={32} className="text-green-400" strokeWidth={1.5} />
            </div>
            <p className="font-bold text-gray-800 text-base mb-1.5">
              {search ? 'No results' : 'No messages yet'}
            </p>
            <p className="text-sm text-gray-400 leading-relaxed">
              {search
                ? `No conversations match "${search}"`
                : 'Book a session to start chatting with teachers and learners.'}
            </p>
          </motion.div>
        )}

        {/* Conversation list */}
        <div className="space-y-2.5">
          {filtered.map((c, i) => {
            const [from, to] = avatarGradient(c.other_participant.name);
            const hasUnread = c.unread_count > 0;
            return (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActiveConv(c)}
                className="w-full flex items-center gap-3.5 bg-white rounded-2xl p-4 text-left active:scale-[0.98] transition-transform"
                style={{
                  border: `1px solid ${hasUnread ? '#D1FAE5' : '#F3F4F6'}`,
                  boxShadow: hasUnread
                    ? '0 2px 8px rgba(34,197,94,0.08)'
                    : '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm select-none"
                    style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
                    {initials(c.other_participant.name)}
                  </div>
                  {/* Online dot */}
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`text-sm truncate ${hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                      {c.other_participant.name ?? 'Unknown'}
                    </p>
                    <p className={`text-[11px] flex-shrink-0 ${hasUnread ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
                      {relativeTime(c.last_message_at)}
                    </p>
                  </div>
                  <p className={`text-xs truncate ${hasUnread ? 'text-gray-600 font-medium' : 'text-gray-400'}`}>
                    {c.last_message ?? 'No messages yet'}
                  </p>
                </div>

                {/* Unread badge */}
                {hasUnread && (
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
                    {c.unread_count > 9 ? '9+' : c.unread_count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Chat overlay */}
      <AnimatePresence>
        {activeConv && profile && (
          <ChatWindow
            conversationId={activeConv.id}
            currentUserId={profile.id}
            otherParticipant={activeConv.other_participant}
            onBack={() => setActiveConv(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
