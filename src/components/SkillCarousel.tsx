import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SkillCard from './SkillCard';
import type { Category } from '../types';

interface Props {
  skills?: Category[];
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
}

export default function SkillCarousel({ skills = [], title, subtitle, headerRight }: Props) {
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(4);

  const updateCardsPerView = useCallback(() => {
    const w = window.innerWidth;
    if (w < 640) setCardsPerView(2);
    else if (w < 1024) setCardsPerView(3);
    else setCardsPerView(4);
  }, []);

  useEffect(() => {
    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, [updateCardsPerView]);

  const totalPages = Math.max(1, Math.ceil(skills.length / cardsPerView));

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages - 1));
  }, [totalPages]);

  const goNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages - 1));
  const goPrev = () => setCurrentPage((p) => Math.max(p - 1, 0));

  const startIdx = currentPage * cardsPerView;
  const visible = skills.slice(startIdx, startIdx + cardsPerView);
  const dragX = useMotionValue(0);
  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -50) goNext();
    else if (info.offset.x > 50) goPrev();
  };

  return (
    <section className="skill-carousel">
      {(title || headerRight) && (
        <div className="skill-carousel__header">
          <div>
            {title && <h2 className="skill-carousel__title">{title}</h2>}
            {subtitle && <p className="skill-carousel__subtitle">{subtitle}</p>}
          </div>
          <div className="skill-carousel__header-right">
            {headerRight}
            {totalPages > 1 && (
              <div className="skill-carousel__nav">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={goPrev} disabled={currentPage === 0}
                  className="skill-carousel__nav-btn" aria-label="Previous skills">
                  <ChevronLeft size={16} />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={goNext} disabled={currentPage === totalPages - 1}
                  className="skill-carousel__nav-btn" aria-label="Next skills">
                  <ChevronRight size={16} />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      )}

      <motion.div className="skill-carousel__track" drag="x"
        dragConstraints={{ left: 0, right: 0 }} dragElastic={0.12}
        onDragEnd={handleDragEnd} style={{ x: dragX }}>
        <AnimatePresence mode="wait">
          <motion.div key={currentPage} className="skill-carousel__grid"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ gridTemplateColumns: `repeat(${cardsPerView}, 1fr)` }}>
            {visible.map((skill, i) => (
              <SkillCard key={skill.id} skill={skill} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {totalPages > 1 && (
        <div className="skill-carousel__dots">
          {Array.from({ length: totalPages }).map((_, i) => (
            <motion.button key={i} onClick={() => setCurrentPage(i)}
              className={`skill-carousel__dot ${i === currentPage ? 'skill-carousel__dot--active' : ''}`}
              whileHover={{ scale: 1.3 }} aria-label={`Skill page ${i + 1}`} />
          ))}
        </div>
      )}
    </section>
  );
}
