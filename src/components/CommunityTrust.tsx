import { motion } from 'framer-motion';
import { Star, Users, Heart, BookOpen, CheckCircle, Quote } from 'lucide-react';
import { testimonials, stats } from '../utils/mockData';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = { Users, Heart, BookOpen, CheckCircle };

export default function CommunityTrust() {
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
          {stats.map((stat, i) => {
            const Icon = iconMap[stat.icon];
            return (
              <motion.div key={stat.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}
                className="rounded-2xl p-5 text-center"
                style={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}>
                {Icon && <div className="flex justify-center mb-2"><Icon size={20} className="text-green-400" /></div>}
                <p className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-400 leading-tight">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[...testimonials, ...testimonials].map((t, i) => (
            <motion.div key={`${t.id}-${i}`}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.45 }}
              whileHover={{ y: -3 }}
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: t.avatarColor }}
                  >
                    <img src={`https://i.pravatar.cc/150?u=${t.id}`} alt={t.learner} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.learner}</p>
                    <p className="text-xs text-gray-400">{t.location} · {t.date}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <Star key={si} size={12} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
              </div>

              <Quote size={16} className="text-green-400 opacity-60" />
              <p className="text-sm text-gray-300 leading-relaxed flex-1">
                "{t.quote}"
              </p>

              <div className="flex items-center gap-2 pt-3 border-t border-gray-700">
                <CheckCircle size={14} className="text-green-400" />
                <span className="text-xs text-gray-400">Vouched for <strong className="text-white">{t.teacher}</strong> · {t.skill}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
