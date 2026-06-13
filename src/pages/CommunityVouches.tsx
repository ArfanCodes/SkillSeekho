import { motion } from 'framer-motion';
import { Heart, Star, BadgeCheck, Quote } from 'lucide-react';
import { testimonials } from '../utils/mockData';

export default function CommunityVouches() {
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
          <p className="text-gray-500 text-lg">Every vouch is a real person standing behind their teacher.</p>
        </motion.div>

        <div className="space-y-5">
          {[...testimonials, ...testimonials].map((t, i) => (
            <motion.div key={`${t.id}-${i}`}
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl p-6 card-shadow flex gap-4"
              style={{ border: '1px solid #F3F4F6' }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: t.avatarColor }}>{t.avatar}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.learner}</p>
                    <p className="text-xs text-gray-400">{t.location} · {t.date}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, si) => (
                      <Star key={si} size={11} fill="#F59E0B" color="#F59E0B" />
                    ))}
                  </div>
                </div>
                <Quote size={14} className="text-green-300 mb-1" />
                <p className="text-sm text-gray-600 leading-relaxed">{t.quote}</p>
                <div className="flex items-center gap-1.5 mt-3">
                  <BadgeCheck size={14} className="text-green-500" />
                  <span className="text-xs text-gray-500">Vouched for <strong>{t.teacher}</strong> · {t.skill}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
