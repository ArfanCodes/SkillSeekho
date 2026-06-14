import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
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

export default function Messages() {
  const { profile } = useAuth();
  const { data: conversations = [], isLoading } = useConversations(profile?.id);
  const [search, setSearch] = useState('');
  const [activeConv, setActiveConv] = useState<ConversationWithParticipant | null>(null);

  const filtered = conversations.filter((c) =>
    !search || c.other_participant.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen px-6 py-14">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Messages</h1>
          <p className="text-gray-500">Chat with your teachers and learners.</p>
        </motion.div>

        <div
          className="flex items-center bg-white rounded-xl px-4 py-2.5 gap-2 mb-6"
          style={{ border: '1px solid #E5E7EB' }}
        >
          <Search size={16} className="text-gray-400" />
          <input
            className="flex-1 text-sm outline-none placeholder-gray-400 bg-transparent"
            placeholder="Search conversations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl px-4 py-4 h-[72px] animate-pulse"
                style={{ border: '1px solid #F3F4F6' }} />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">
              {search ? 'No conversations match your search.' : 'No conversations yet. Book a session to start chatting!'}
            </p>
          </div>
        )}

        <div className="space-y-2">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ x: 3 }}
              onClick={() => setActiveConv(c)}
              className="bg-white rounded-2xl px-4 py-4 flex items-center gap-3 cursor-pointer card-shadow transition-shadow"
              style={{ border: '1px solid #F3F4F6' }}
            >
              <div className="relative flex-shrink-0">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
                >
                  {initials(c.other_participant.name)}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="font-semibold text-gray-900 text-sm">{c.other_participant.name ?? 'Unknown'}</p>
                  <p className="text-xs text-gray-400">{relativeTime(c.last_message_at)}</p>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {c.last_message ?? 'No messages yet'}
                </p>
              </div>
              {c.unread_count > 0 && (
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-bold flex-shrink-0"
                  style={{ backgroundColor: '#22C55E' }}
                >
                  {c.unread_count}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat window overlay */}
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
