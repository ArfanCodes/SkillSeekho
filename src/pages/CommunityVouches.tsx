import { motion } from 'framer-motion';
import { Heart, Star, BadgeCheck, Quote } from 'lucide-react';
import { useRecentReviews } from '../hooks/queries/useCatalogue';

function initials(name: string | null) {
  if (!name) return '?';
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}
const COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444'];

function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

export default function CommunityVouches() {
  const { data: reviews = [], isLoading } = useRecentReviews(30);

  return (
    <div className="min-h-screen px-6 py-14">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-green-700 uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <Heart size={13} fill="#22C55E" color="#22C55E" /> Community Vouches
          </span>
          <h1 className="text-4xl font-black mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Trust, built by the community
          </h1>
          <p className="text-gray-500 text-lg">Every review is a real person standing behind their teacher.</p>
        </motion.div>

        {isLoading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center card-shadow" style={{ border: '1px solid #F3F4F6' }}>
            <Heart size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No reviews yet — they'll appear here after sessions.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {reviews.map((t, i) => (
              <motion.div key={t.id}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: Math.min(i, 8) * 0.05 }}
                className="bg-white rounded-2xl p-6 card-shadow flex gap-4"
                style={{ border: '1px solid #F3F4F6' }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}>{initials(t.learner_name)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{t.learner_name ?? 'Learner'}</p>
                      <p className="text-xs text-gray-400">{timeAgo(t.created_at)}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, si) => (
                        <Star key={si} size={11} fill="#F59E0B" color="#F59E0B" />
                      ))}
                    </div>
                  </div>
                  <Quote size={14} className="text-green-300 mb-1" />
                  <p className="text-sm text-gray-600 leading-relaxed">{t.comment}</p>
                  <div className="flex items-center gap-1.5 mt-3">
                    <BadgeCheck size={14} className="text-green-500" />
                    <span className="text-xs text-gray-500">Vouched for <strong>{t.teacher_name}</strong> · {t.skill_title}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
