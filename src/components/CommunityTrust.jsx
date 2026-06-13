import { motion } from 'framer-motion';
import { Star, Users, Heart, BookOpen, CheckCircle, Quote } from 'lucide-react';
import { testimonials, stats } from '../utils/mockData';

const iconMap = { Users, Heart, BookOpen, CheckCircle };

export default function CommunityTrust() {
  return (
    <section className="px-6 py-12" style={{ backgroundColor: '#111827' }}>
      <div className="max-w-5xl mx-auto">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-400 mb-3">
            Community Trust
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Real learners. Real results.
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            Every teacher is vouched by their community — not an algorithm.
          </p>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {stats.map((stat, i) => {
            const Icon = iconMap[stat.icon];
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="rounded-2xl p-5 text-center"
                style={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              >
                {Icon && (
                  <div className="flex justify-center mb-2">
                    <Icon size={20} className="text-green-400" />
                  </div>
                )}
                <p className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-400 leading-tight">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.45 }}
              whileHover={{ y: -3 }}
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
            >
              {/* Quote icon */}
              <Quote size={20} className="text-green-400 opacity-60" />

              {/* Quote text */}
              <p className="text-sm text-gray-300 leading-relaxed flex-1">
                "{t.quote}"
              </p>

              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, si) => (
                  <Star key={si} size={12} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>

              {/* Learner info */}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-700">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: t.avatarColor }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.learner}</p>
                  <p className="text-xs text-gray-500">
                    Learned {t.skill} from {t.teacher} · {t.date}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
