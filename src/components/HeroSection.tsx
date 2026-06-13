import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Mic, ArrowRight } from 'lucide-react';
import { useCategories } from '../hooks/queries/useCatalogue';

export default function HeroSection() {
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();
  const [query, setQuery] = useState('');

  const runSearch = (q: string) => {
    const term = q.trim();
    navigate(term ? `/discover?q=${encodeURIComponent(term)}` : '/discover');
  };

  return (
    <section className="relative overflow-hidden px-6 py-16 md:py-24">
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #22C55E, transparent 70%)' }} />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full opacity-[0.08] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #3B82F6, transparent 70%)' }} />

      <div className="relative max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6"
          style={{ backgroundColor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Voice-first · Hyperlocal · Community-trusted
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-5xl md:text-7xl font-black mb-4"
          style={{ fontFamily: 'Outfit, sans-serif', color: '#111827', letterSpacing: '-0.03em' }}>
          Speak.{' '}<span className="gradient-text">Learn.</span>{' '}Earn.
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-lg md:text-xl text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
          Find trusted teachers and local experts in your neighbourhood.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center bg-white rounded-2xl p-2 mb-6 max-w-xl mx-auto"
          style={{ border: '1.5px solid #E5E7EB', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <Search size={18} className="ml-3 text-gray-400 flex-shrink-0" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') runSearch(query); }}
            placeholder="Search a skill, teacher or neighbourhood…"
            className="flex-1 px-3 py-2 text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400" />
          <motion.button onClick={() => navigate('/voice')} whileTap={{ scale: 0.92 }}
            className="flex items-center justify-center w-10 h-10 rounded-xl mr-1 transition-all bg-gray-100 text-gray-500 hover:bg-gray-200"
            aria-label="Voice search">
            <Mic size={16} strokeWidth={2} />
          </motion.button>
          <motion.button onClick={() => runSearch(query)} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
            Search <ArrowRight size={14} />
          </motion.button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
          className="flex flex-wrap justify-center gap-2">
          <span className="text-xs text-gray-400 self-center">Try:</span>
          {categories.slice(0, 6).map((cat, i) => (
            <motion.button key={cat.id}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 + i * 0.06 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => runSearch(cat.name)}
              className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
              style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', color: '#374151' }}>
              {cat.name}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
