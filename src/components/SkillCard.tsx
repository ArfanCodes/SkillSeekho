import { motion } from 'framer-motion';
import type { SkillCategory } from '../types';

interface Props { skill: SkillCategory; index?: number; }

export default function SkillCard({ skill, index = 0 }: Props) {
  const { name, count, color, bg, image } = skill;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -8, scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="skill-card">
      <div className="skill-card__image-area" style={{ backgroundColor: bg }}>
        <img src={image} alt={name} className="skill-card__image" loading="lazy" />
        <div className="skill-card__count-pill">
          <span className="skill-card__count-dot" style={{ backgroundColor: color }} />
          {count} teachers
        </div>
      </div>
      <div className="skill-card__label">
        <h3 className="skill-card__name">{name}</h3>
      </div>
    </motion.button>
  );
}
