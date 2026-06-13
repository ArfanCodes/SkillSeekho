import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TeacherCard from './TeacherCard';
import type { Mentor } from '../types';

interface Props {
  teachers?: Mentor[];
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  autoPlay?: boolean;
}

export default function TeacherCarousel({ teachers = [], title, subtitle, headerRight, autoPlay = false }: Props) {
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateCardsPerView = useCallback(() => {
    const w = window.innerWidth;
    if (w < 768) setCardsPerView(1);
    else if (w < 1280) setCardsPerView(2);
    else setCardsPerView(3);
  }, []);

  useEffect(() => {
    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, [updateCardsPerView]);

  const totalPages = Math.max(1, Math.ceil(teachers.length / cardsPerView));

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages - 1));
  }, [totalPages]);

  useEffect(() => {
    if (!autoPlay) return;
    autoPlayRef.current = setInterval(() => setCurrentPage((p) => (p + 1) % totalPages), 5000);
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [autoPlay, totalPages]);

  const pause = () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  const goNext = () => { pause(); setCurrentPage((p) => Math.min(p + 1, totalPages - 1)); };
  const goPrev = () => { pause(); setCurrentPage((p) => Math.max(p - 1, 0)); };

  const startIdx = currentPage * cardsPerView;
  const visible = teachers.slice(startIdx, startIdx + cardsPerView);
  const dragX = useMotionValue(0);
  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -60) goNext();
    else if (info.offset.x > 60) goPrev();
  };

  return (
    <section className="teacher-carousel">
      {(title || headerRight) && (
        <div className="teacher-carousel__header">
          <div>
            {title && <h2 className="teacher-carousel__title">{title}</h2>}
            {subtitle && <p className="teacher-carousel__subtitle">{subtitle}</p>}
          </div>
          <div className="teacher-carousel__header-right">
            {headerRight}
            {totalPages > 1 && (
              <div className="teacher-carousel__nav">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={goPrev} disabled={currentPage === 0}
                  className="teacher-carousel__nav-btn" aria-label="Previous">
                  <ChevronLeft size={18} />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={goNext} disabled={currentPage === totalPages - 1}
                  className="teacher-carousel__nav-btn" aria-label="Next">
                  <ChevronRight size={18} />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      )}

      <motion.div className="teacher-carousel__track" drag="x"
        dragConstraints={{ left: 0, right: 0 }} dragElastic={0.15}
        onDragEnd={handleDragEnd} style={{ x: dragX }}>
        <AnimatePresence mode="wait">
          <motion.div key={currentPage} className="teacher-carousel__grid"
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ gridTemplateColumns: `repeat(${cardsPerView}, 1fr)` }}>
            {visible.map((teacher, i) => (
              <TeacherCard key={teacher.id} mentor={teacher} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {totalPages > 1 && (
        <div className="teacher-carousel__dots">
          {Array.from({ length: totalPages }).map((_, i) => (
            <motion.button key={i} onClick={() => { pause(); setCurrentPage(i); }}
              className={`teacher-carousel__dot ${i === currentPage ? 'teacher-carousel__dot--active' : ''}`}
              whileHover={{ scale: 1.3 }} aria-label={`Page ${i + 1}`} />
          ))}
        </div>
      )}
    </section>
  );
}
