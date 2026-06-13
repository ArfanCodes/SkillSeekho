import { motion } from 'framer-motion';
import { Star, Users, Heart, BookOpen, Quote } from 'lucide-react';
import { useCatalogueStats, useRecentReviews } from '../hooks/queries/useCatalogue';

function initials(name: string | null) {
  if (!name) return '?';
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}
const COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444'];

export default function CommunityTrust() {
  const { data: stats } = useCatalogueStats();
  const { data: reviews = [] } = useRecentReviews(6);

  const cards = [
    { label: 'Teachers',          value: stats?.teachers ?? 0, Icon: Users },
    { label: 'Skills Listed',     value: stats?.skills ?? 0,   Icon: BookOpen },
    { label: 'Community Vouches', value: stats?.vouches ?? 0,  Icon: Heart },
    { label: 'Reviews',           value: stats?.reviews ?? 0,  Icon: Star },
  ];

  return (
    <section className="px-6 py-12" style={{ backgroundColor: '#111827' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Real learners. Real reviews.
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            Every teacher is vouched by their community — not an algorithm. Read our community reviews below.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {cards.map((stat, i) => (
            <motion.div key={stat.label}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}
              className="rounded-2xl p-5 text-center"
              style={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}>
              <div className="flex justify-center mb-2"><stat.Icon size={20} className="text-green-400" /></div>
              <p className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {stat.value.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-400 leading-tight">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {reviews.slice(0, 3).map((t, i) => (
              <motion.div key={t.id}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.45 }}
                whileHover={{ y: -3 }}
                className="rounded-2xl p-6 flex flex-col gap-4"
                style={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}>
                <Quote size={20} className="text-green-400 opacity-60" />
                <p className="text-sm text-gray-300 leading-relaxed flex-1">"{t.comment}"</p>
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <Star key={si} size={12} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-gray-700">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}>{initials(t.learner_name)}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.learner_name ?? 'Learner'}</p>
                    <p className="text-xs text-gray-500">Learned {t.skill_title} from {t.teacher_name}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
