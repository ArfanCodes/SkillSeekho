import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Heart, BadgeCheck, ShieldCheck, Calendar, MessageSquare } from 'lucide-react';
import type { SkillWithTeacher } from '../types';
import ReviewsModal from './ReviewsModal';

const AVATAR_COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444', '#06B6D4', '#F97316'];

function initials(name: string | null) {
  if (!name) return '?';
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}
function colorFor(name: string | null) {
  const s = name ?? '';
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

interface Props { skill: SkillWithTeacher; index?: number; }

export default function SkillTeacherCard({ skill, index = 0 }: Props) {
  const navigate = useNavigate();
  const [showReviews, setShowReviews] = useState(false);
  const {
    id, title, description, price_per_session, currency, tags,
    teacher_name, teacher_avatar_url, avg_rating, review_count, vouch_count,
    distance_km, location_name, cover_image_url,
  } = skill;

  const hasReviews = review_count > 0;
  const distanceLabel = distance_km != null ? `${distance_km.toFixed(1)} km` : (location_name ?? '');
  const symbol = currency === 'INR' ? '₹' : currency;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ delay: index * 0.06, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="teacher-card">
        {/* Image / avatar side */}
        <div className="teacher-card__image">
          {cover_image_url || teacher_avatar_url
            ? <img src={(cover_image_url || teacher_avatar_url) as string} alt={teacher_name ?? ''} className="teacher-card__photo" loading="lazy" />
            : <div className="teacher-card__avatar-fallback" style={{ backgroundColor: colorFor(teacher_name) }}>{initials(teacher_name)}</div>
          }
          {skill.teacher_verified && (
            <div className="teacher-card__verified-badge"><ShieldCheck size={12} /><span>Verified</span></div>
          )}
          <div className="teacher-card__price-badge">
            <span className="teacher-card__price">{symbol}{price_per_session}</span>
            <span className="teacher-card__price-label">/ session</span>
          </div>
        </div>

        {/* Details side */}
        <div className="teacher-card__details">
          <div className="teacher-card__header">
            <div className="teacher-card__name-row">
              <h3 className="teacher-card__name">{teacher_name}</h3>
              {skill.teacher_verified && <BadgeCheck size={16} fill="#22C55E" color="white" className="flex-shrink-0" />}
            </div>
            <p className="teacher-card__skill">{title}</p>
          </div>

          <div className="teacher-card__stats">
            <div className="teacher-card__stat">
              <Star size={13} fill={hasReviews ? '#F59E0B' : '#D1D5DB'} color={hasReviews ? '#F59E0B' : '#D1D5DB'} />
              {hasReviews
                ? <><span className="teacher-card__stat-value">{avg_rating}</span><span className="teacher-card__stat-sub">({review_count})</span></>
                : <span className="teacher-card__stat-sub">New</span>}
            </div>
            {vouch_count > 0 && (
              <>
                <div className="teacher-card__stat-divider" />
                <div className="teacher-card__stat">
                  <Heart size={13} fill="#EF4444" color="#EF4444" />
                  <span className="teacher-card__stat-value">{vouch_count}</span>
                  <span className="teacher-card__stat-sub">vouches</span>
                </div>
              </>
            )}
            {distanceLabel && (
              <>
                <div className="teacher-card__stat-divider" />
                <div className="teacher-card__stat">
                  <MapPin size={13} className="text-gray-400" />
                  <span className="teacher-card__stat-sub">{distanceLabel}</span>
                </div>
              </>
            )}
          </div>

          {description && <p className="teacher-card__bio">{description}</p>}

          <div className="teacher-card__tags">
            {tags.map((tag) => <span key={tag} className="teacher-card__tag">{tag}</span>)}
          </div>

          <div className="teacher-card__actions">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/skill/${id}`)}
              className="teacher-card__btn-primary">
              <Calendar size={14} /> View &amp; Book
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => { e.stopPropagation(); setShowReviews(true); }}
              className="teacher-card__btn-reviews"
              aria-label={`Read reviews for ${teacher_name}`}
            >
              <MessageSquare size={14} />
              Reviews
              {review_count > 0 && (
                <span className="teacher-card__btn-reviews-count">{review_count}</span>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {showReviews && (
        <ReviewsModal skill={skill} onClose={() => setShowReviews(false)} />
      )}
    </>
  );
}
