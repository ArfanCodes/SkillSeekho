import { motion } from 'framer-motion';
import { MessageSquare, Send, Search } from 'lucide-react';

const conversations = [
  { id: 1, name: 'Priya Sharma',   avatar: 'PS', color: '#22C55E', skill: 'Photography',    last: 'See you Sunday at 10 AM!',        time: '10:32 AM', unread: 2 },
  { id: 2, name: 'Arjun Mehta',    avatar: 'AM', color: '#3B82F6', skill: 'Biryani Making', last: 'Bring your own masala box 😄',     time: 'Yesterday', unread: 0 },
  { id: 3, name: 'Meena Krishnan', avatar: 'MK', color: '#F59E0B', skill: 'Tailoring',      last: 'Pattern is ready for review',     time: 'Mon',       unread: 1 },
  { id: 4, name: 'Ravi Nair',      avatar: 'RN', color: '#EC4899', skill: 'Spoken English', last: 'Great session today, keep it up!', time: 'Sun',       unread: 0 },
];

export default function Messages() {
  return (
    <div className="min-h-screen px-6 py-14">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Messages</h1>
          <p className="text-gray-500">Chat with your teachers and learners.</p>
        </motion.div>

        <div className="flex items-center bg-white rounded-xl px-4 py-2.5 gap-2 mb-6"
          style={{ border: '1px solid #E5E7EB' }}>
          <Search size={16} className="text-gray-400" />
          <input className="flex-1 text-sm outline-none placeholder-gray-400 bg-transparent"
            placeholder="Search conversations…" />
        </div>

        <div className="space-y-2">
          {conversations.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              whileHover={{ x: 3 }}
              className="bg-white rounded-2xl px-4 py-4 flex items-center gap-3 cursor-pointer card-shadow transition-shadow"
              style={{ border: '1px solid #F3F4F6' }}>
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: c.color }}>{c.avatar}</div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.time}</p>
                </div>
                <p className="text-xs text-gray-400 mb-0.5">{c.skill}</p>
                <p className="text-xs text-gray-500 truncate">{c.last}</p>
              </div>
              {c.unread > 0 && (
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-bold flex-shrink-0"
                  style={{ backgroundColor: '#22C55E' }}>{c.unread}</span>
              )}
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl"
          style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
          <Send size={20} />
        </motion.button>
      </div>
    </div>
  );
}
