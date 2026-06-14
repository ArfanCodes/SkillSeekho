import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  X, Star, MessageCircle, ShieldCheck, CheckCircle2,
  User, Info, Loader2,
} from 'lucide-react';
import { useTeacherReviews } from '../hooks/queries/useCatalogue';
import type { SkillWithTeacher } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#22C55E', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444', '#06B6D4', '#F97316',
];

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

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="reviews-modal__stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          fill={i <= rating ? '#F59E0B' : '#E5E7EB'}
          color={i <= rating ? '#F59E0B' : '#E5E7EB'}
        />
      ))}
    </span>
  );
}

// ─── Message Reviewer modal (inline) ─────────────────────────────────────────

interface MessageModalProps {
  reviewerName: string | null;
  teacherName: string | null;
  onClose: () => void;
  onSend: (message: string) => void;
}

function MessageReviewerModal({ reviewerName, teacherName, onClose, onSend }: MessageModalProps) {
  const prefill = `Hi${reviewerName ? ` ${reviewerName.split(' ')[0]}` : ''}, I saw your review of ${teacherName ?? 'this tutor'} and wanted to know more about your experience learning from them.`;
  const [msg, setMsg] = useState(prefill);

  return (
    <motion.div
      className="reviews-modal__msg-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        className="reviews-modal__msg-panel"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
      >
        <div className="reviews-modal__msg-header">
          <div>
            <h3 className="reviews-modal__msg-title">Message Reviewer</h3>
            <p className="reviews-modal__msg-subtitle">
              Your message will be delivered via SkillSeekho chat
            </p>
          </div>
          <button onClick={onClose} className="reviews-modal__close-sm" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="reviews-modal__msg-to">
          <User size={14} className="reviews-modal__msg-to-icon" />
          <span>To: <strong>{reviewerName ?? 'Reviewer'}</strong></span>
        </div>

        <textarea
          className="reviews-modal__msg-textarea"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          rows={5}
          placeholder="Write your message…"
        />

        <div className="reviews-modal__msg-info">
          <Info size={12} />
          <span>
            Reviews are from learners who interacted with this tutor. You can message them directly to verify experiences before booking.
          </span>
        </div>

        <div className="reviews-modal__msg-actions">
          <button onClick={onClose} className="reviews-modal__btn-ghost">Cancel</button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { onSend(msg); onClose(); }}
            className="reviews-modal__btn-send"
            disabled={!msg.trim()}
          >
            <MessageCircle size={14} />
            Send Message
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  skill: SkillWithTeacher;
  onClose: () => void;
}

export default function ReviewsModal({ skill, onClose }: Props) {
  const navigate = useNavigate();
  const { data: reviews = [], isLoading } = useTeacherReviews(skill.teacher_id);

  const [messagingReviewer, setMessagingReviewer] = useState<{
    name: string | null;
    learnerId: string;
  } | null>(null);

  // ── Derived stats ────────────────────────────────────────────────────────
  const totalReviews = reviews.length;
  const avgRating = totalReviews
    ? +(reviews.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1)
    : 0;

  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: totalReviews
      ? Math.round((reviews.filter((r) => r.rating === star).length / totalReviews) * 100)
      : 0,
  }));

  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleSendMessage(learnerId: string, _message: string) {
    // In a real app: getOrCreateConversation(currentUserId, learnerId) then navigate.
    // For now we navigate to the messages tab as a placeholder.
    navigate('/messages');
    onClose();
  }

  const teacherAvatar = skill.teacher_avatar_url;
  const hasAvatar = !!teacherAvatar;

  return createPortal(
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        {/* Backdrop */}
        <motion.div
          className="reviews-modal__backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Sheet */}
        <motion.div
          className="reviews-modal__sheet"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        >

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="reviews-modal__header">
            <div className="reviews-modal__teacher-info">
              {hasAvatar
                ? <img src={teacherAvatar!} alt={skill.teacher_name ?? ''} className="reviews-modal__teacher-avatar" loading="lazy" />
                : (
                  <div
                    className="reviews-modal__teacher-avatar reviews-modal__teacher-avatar--fallback"
                    style={{ backgroundColor: colorFor(skill.teacher_name) }}
                  >
                    {initials(skill.teacher_name)}
                  </div>
                )
              }
              <div>
                <h2 className="reviews-modal__teacher-name">{skill.teacher_name}</h2>
                <p className="reviews-modal__teacher-skill">{skill.title}</p>
                <div className="reviews-modal__teacher-rating">
                  <Stars rating={Math.round(avgRating)} size={14} />
                  <span className="reviews-modal__rating-num">{avgRating > 0 ? avgRating : '—'}</span>
                  <span className="reviews-modal__rating-count">
                    {totalReviews > 0 ? `${totalReviews} review${totalReviews !== 1 ? 's' : ''}` : 'No reviews yet'}
                  </span>
                </div>
              </div>
            </div>

            <button onClick={onClose} className="reviews-modal__close" aria-label="Close reviews">
              <X size={20} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="reviews-modal__body">

            {/* ── Rating breakdown ──────────────────────────────────── */}
            {totalReviews > 0 && (
              <div className="reviews-modal__breakdown">
                <div className="reviews-modal__breakdown-left">
                  <span className="reviews-modal__big-rating">{avgRating}</span>
                  <Stars rating={Math.round(avgRating)} size={18} />
                  <span className="reviews-modal__breakdown-count">{totalReviews} reviews</span>
                </div>
                <div className="reviews-modal__breakdown-bars">
                  {breakdown.map(({ star, count, pct }) => (
                    <div key={star} className="reviews-modal__bar-row">
                      <span className="reviews-modal__bar-label">{star}★</span>
                      <div className="reviews-modal__bar-track">
                        <motion.div
                          className="reviews-modal__bar-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: (5 - star) * 0.07 }}
                        />
                      </div>
                      <span className="reviews-modal__bar-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Trust note ────────────────────────────────────────── */}
            <div className="reviews-modal__trust-note">
              <ShieldCheck size={15} className="reviews-modal__trust-icon" />
              <p>
                Community reviews are from learners who have interacted with this tutor.{' '}
                <strong>Message reviewers directly</strong> to verify experiences before booking.
              </p>
            </div>

            {/* ── Review cards ──────────────────────────────────────── */}
            {isLoading ? (
              <div className="reviews-modal__loading">
                <Loader2 size={28} className="reviews-modal__spinner" />
                <p>Loading reviews…</p>
              </div>
            ) : totalReviews === 0 ? (
              <div className="reviews-modal__empty">
                <MessageCircle size={40} className="reviews-modal__empty-icon" />
                <h3 className="reviews-modal__empty-title">No reviews yet</h3>
                <p className="reviews-modal__empty-sub">
                  Be the first to share your experience with {skill.teacher_name?.split(' ')[0] ?? 'this teacher'}!
                </p>
              </div>
            ) : (
              <div className="reviews-modal__reviews-list">
                {reviews.map((review, i) => (
                  <motion.div
                    key={review.id}
                    className="reviews-modal__review-card"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    {/* Card header */}
                    <div className="reviews-modal__rc-header">
                      <div className="reviews-modal__rc-avatar-wrap">
                        {review.learner_avatar_url
                          ? <img src={review.learner_avatar_url} alt={review.learner_name ?? ''} className="reviews-modal__rc-avatar" loading="lazy" />
                          : (
                            <div
                              className="reviews-modal__rc-avatar reviews-modal__rc-avatar--fallback"
                              style={{ backgroundColor: colorFor(review.learner_name) }}
                            >
                              {initials(review.learner_name)}
                            </div>
                          )
                        }
                      </div>
                      <div className="reviews-modal__rc-meta">
                        <div className="reviews-modal__rc-name-row">
                          <span className="reviews-modal__rc-name">{review.learner_name ?? 'Anonymous'}</span>
                          {review.had_session && (
                            <span className="reviews-modal__rc-verified-badge">
                              <CheckCircle2 size={11} />
                              Verified Session
                            </span>
                          )}
                        </div>
                        <div className="reviews-modal__rc-subrow">
                          <Stars rating={review.rating} size={12} />
                          <span className="reviews-modal__rc-date">{timeAgo(review.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Review text */}
                    {review.comment && (
                      <p className="reviews-modal__rc-comment">"{review.comment}"</p>
                    )}

                    {/* Message reviewer */}
                    <button
                      className="reviews-modal__rc-msg-btn"
                      onClick={() => setMessagingReviewer({
                        name: review.learner_name,
                        learnerId: review.learner_id,
                      })}
                    >
                      <MessageCircle size={13} />
                      Message Reviewer
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Message reviewer sub-modal */}
        <AnimatePresence>
          {messagingReviewer && (
            <MessageReviewerModal
              reviewerName={messagingReviewer.name}
              teacherName={skill.teacher_name}
              onClose={() => setMessagingReviewer(null)}
              onSend={(msg) => handleSendMessage(messagingReviewer.learnerId, msg)}
            />
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>,
    document.body,
  );
}
