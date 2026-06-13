import { motion } from 'framer-motion';

/**
 * Vertical skill card — large illustration (70%) + name centered below.
 * Minimal, clean, premium design with hover lift + scale.
 *
 * @param {Object}  skill  — { id, name, count, color, bg, image }
 * @param {number}  index  — for staggered animation
 */
export default function SkillCard({ skill, index = 0 }) {
  const { name, count, color, bg, image } = skill;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{
        delay: index * 0.05,
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ y: -8, scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="skill-card"
    >
      {/* ── Illustration area (70%) ──────────────── */}
      <div className="skill-card__image-area" style={{ backgroundColor: bg }}>
        <img
          src={image}
          alt={name}
          className="skill-card__image"
          loading="lazy"
        />

        {/* Teacher count pill */}
        <div className="skill-card__count-pill">
          <span className="skill-card__count-dot" style={{ backgroundColor: color }} />
          {count} teachers
        </div>
      </div>

      {/* ── Name area (30%) ─────────────────────── */}
      <div className="skill-card__label">
        <h3 className="skill-card__name">{name}</h3>
      </div>
    </motion.button>
  );
}
