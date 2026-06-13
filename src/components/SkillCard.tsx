import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Camera, ChefHat, Scissors, MessageCircle, Music, Leaf, Code2, Palette, Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Category } from '../types';

const ICONS: Record<string, LucideIcon> = {
  Camera, ChefHat, Scissors, MessageCircle, Music, Leaf, Code2, Palette,
};

interface Props { skill: Category; index?: number; }

export default function SkillCard({ skill, index = 0 }: Props) {
  const navigate = useNavigate();
  const { id, name, count, color, bg, image_url, icon } = skill;
  const Icon = ICONS[icon] ?? Sparkles;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -8, scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/discover?category=${id}`)}
      className="skill-card">
      <div className="skill-card__image-area flex items-center justify-center" style={{ backgroundColor: bg }}>
        {image_url
          ? <img src={image_url} alt={name} className="skill-card__image" loading="lazy" />
          : <Icon size={40} color={color} strokeWidth={1.8} />}
        <div className="skill-card__count-pill">
          <span className="skill-card__count-dot" style={{ backgroundColor: color }} />
          {count ?? 0} {count === 1 ? 'teacher' : 'teachers'}
        </div>
      </div>
      <div className="skill-card__label">
        <h3 className="skill-card__name">{name}</h3>
      </div>
    </motion.button>
  );
}
