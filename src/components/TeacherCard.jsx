import { motion } from 'framer-motion';
import {
  Star, MapPin, Heart, BadgeCheck, ShieldCheck,
  MessageCircle, Calendar, ChevronRight,
} from 'lucide-react';

export default function TeacherCard({ mentor, index = 0 }) {
  const {
    name, avatar, avatarColor, photo, skill, distance,
    rating, reviews, vouches, pricePerSession, currency,
    verified, location: loc, tags, badges = [], bio,
  } = mentor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.06, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="teacher-card"
    >
      {/* ── Left: Teacher Photo (35%) ────────────────── */}
      <div className="teacher-card__image">
        {photo ? (
          <img
            src={photo}
            alt={name}
            className="teacher-card__photo"
            loading="lazy"
          />
        ) : (
          <div
            className="teacher-card__avatar-fallback"
            style={{ backgroundColor: avatarColor }}
          >
            {avatar}
          </div>
        )}
        {/* Verified overlay badge */}
        {verified && (
          <div className="teacher-card__verified-badge">
            <ShieldCheck size={12} />
            <span>Verified</span>
          </div>
        )}
        {/* Price overlay */}
        <div className="teacher-card__price-badge">
          <span className="teacher-card__price">{currency}{pricePerSession}</span>
          <span className="teacher-card__price-label">/ session</span>
        </div>
      </div>

      {/* ── Right: Teacher Details (65%) ─────────────── */}
      <div className="teacher-card__details">
        {/* Top row: Name + Skill */}
        <div className="teacher-card__header">
          <div className="teacher-card__name-row">
            <h3 className="teacher-card__name">{name}</h3>
            {verified && (
              <BadgeCheck size={16} fill="#22C55E" color="white" className="flex-shrink-0" />
            )}
          </div>
          <p className="teacher-card__skill">{skill}</p>
        </div>

        {/* Stats row: Rating · Vouches · Distance */}
        <div className="teacher-card__stats">
          <div className="teacher-card__stat">
            <Star size={13} fill="#F59E0B" color="#F59E0B" />
            <span className="teacher-card__stat-value">{rating}</span>
            <span className="teacher-card__stat-sub">({reviews})</span>
          </div>
          <div className="teacher-card__stat-divider" />
          <div className="teacher-card__stat">
            <Heart size={13} fill="#EF4444" color="#EF4444" />
            <span className="teacher-card__stat-value">{vouches}</span>
            <span className="teacher-card__stat-sub">vouches</span>
          </div>
          <div className="teacher-card__stat-divider" />
          <div className="teacher-card__stat">
            <MapPin size={13} className="text-gray-400" />
            <span className="teacher-card__stat-sub">{distance}</span>
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="teacher-card__badges">
            {badges.map((badge) => (
              <span key={badge} className="teacher-card__badge">{badge}</span>
            ))}
          </div>
        )}

        {/* Bio */}
        <p className="teacher-card__bio">{bio}</p>

        {/* Tags */}
        <div className="teacher-card__tags">
          {tags.map((tag) => (
            <span key={tag} className="teacher-card__tag">{tag}</span>
          ))}
        </div>

        {/* Actions */}
        <div className="teacher-card__actions">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="teacher-card__btn-primary"
          >
            <Calendar size={14} />
            Book Session
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="teacher-card__btn-secondary"
          >
            <MessageCircle size={14} />
            Message
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="teacher-card__btn-icon"
            aria-label="Save teacher"
          >
            <Heart size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
