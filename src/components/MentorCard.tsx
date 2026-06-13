import { motion } from 'framer-motion';
import { Star, MapPin, Heart, BadgeCheck } from 'lucide-react';
import type { Mentor } from '../types';

interface Props { mentor: Mentor; index?: number; }

export default function MentorCard({ mentor, index = 0 }: Props) {
  const { name, avatar, avatarColor, skill, distance, rating, reviews, vouches,
          pricePerSession, currency, verified, location: loc, tags } = mentor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl p-5 card-shadow card-shadow-hover cursor-pointer flex flex-col gap-4"
      style={{ border: '1px solid #F3F4F6' }}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ backgroundColor: avatarColor }}>{avatar}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">{name}</h3>
            {verified && <BadgeCheck size={15} className="text-green-500 flex-shrink-0" fill="#22C55E" color="white" />}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{skill}</p>
          <div className="flex items-center gap-1 mt-1">
            <MapPin size={11} className="text-gray-400" />
            <span className="text-xs text-gray-400">{loc} · {distance}</span>
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="font-bold text-gray-900 text-sm">{currency}{pricePerSession}</p>
          <p className="text-xs text-gray-400">/ session</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: '#F0FDF4', color: '#15803D' }}>{tag}</span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1">
          <Star size={13} fill="#F59E0B" color="#F59E0B" />
          <span className="text-sm font-semibold text-gray-800">{rating}</span>
          <span className="text-xs text-gray-400">({reviews})</span>
        </div>
        <div className="flex items-center gap-1">
          <Heart size={13} fill="#EF4444" color="#EF4444" />
          <span className="text-xs font-medium text-gray-600">{vouches} vouches</span>
        </div>
        <button className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
          Book
        </button>
      </div>
    </motion.div>
  );
}
