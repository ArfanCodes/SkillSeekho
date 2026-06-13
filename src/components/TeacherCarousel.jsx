import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TeacherCard from './TeacherCard';

/**
 * Reusable horizontal teacher carousel.
 * Shows 3 cards on desktop, 2 on tablet, 1 on mobile.
 *
 * @param {Object[]}  teachers   — Array of mentor objects
 * @param {string}    title      — Section heading
 * @param {string}    subtitle   — Optional subheading
 * @param {JSX}       headerRight — Optional right-side header content
 * @param {boolean}   autoPlay   — Auto-scroll (default: false)
 */
export default function TeacherCarousel({
  teachers = [],
  title,
  subtitle,
  headerRight,
  autoPlay = false,
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const containerRef = useRef(null);
  const autoPlayRef = useRef(null);

  // ── Responsive breakpoints ─────────────────────
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

  // Clamp page when breakpoint changes
  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages - 1));
  }, [totalPages]);

  // ── Auto-play ──────────────────────────────────
  useEffect(() => {
    if (!autoPlay) return;
    autoPlayRef.current = setInterval(() => {
      setCurrentPage((p) => (p + 1) % totalPages);
    }, 5000);
    return () => clearInterval(autoPlayRef.current);
  }, [autoPlay, totalPages]);

  const pauseAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  // ── Navigation ─────────────────────────────────
  const goNext = () => {
    pauseAutoPlay();
    setCurrentPage((p) => Math.min(p + 1, totalPages - 1));
  };
  const goPrev = () => {
    pauseAutoPlay();
    setCurrentPage((p) => Math.max(p - 1, 0));
  };

  // Current visible slice
  const startIdx = currentPage * cardsPerView;
  const visibleTeachers = teachers.slice(startIdx, startIdx + cardsPerView);

  // ── Swipe support via drag ─────────────────────
  const dragX = useMotionValue(0);

  const handleDragEnd = (_, info) => {
    const threshold = 60;
    if (info.offset.x < -threshold) goNext();
    else if (info.offset.x > threshold) goPrev();
  };

  return (
    <section className="teacher-carousel">
      {/* ── Header ────────────────────────────────── */}
      {(title || headerRight) && (
        <div className="teacher-carousel__header">
          <div>
            {title && (
              <h2 className="teacher-carousel__title">{title}</h2>
            )}
            {subtitle && (
              <p className="teacher-carousel__subtitle">{subtitle}</p>
            )}
          </div>
          <div className="teacher-carousel__header-right">
            {headerRight}
            {/* Navigation arrows */}
            {totalPages > 1 && (
              <div className="teacher-carousel__nav">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={goPrev}
                  disabled={currentPage === 0}
                  className="teacher-carousel__nav-btn"
                  aria-label="Previous"
                >
                  <ChevronLeft size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={goNext}
                  disabled={currentPage === totalPages - 1}
                  className="teacher-carousel__nav-btn"
                  aria-label="Next"
                >
                  <ChevronRight size={18} />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Carousel track ────────────────────────── */}
      <motion.div
        ref={containerRef}
        className="teacher-carousel__track"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        style={{ x: dragX }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            className="teacher-carousel__grid"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              gridTemplateColumns: `repeat(${cardsPerView}, 1fr)`,
            }}
          >
            {visibleTeachers.map((teacher, i) => (
              <TeacherCard key={teacher.id} mentor={teacher} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── Pagination dots ───────────────────────── */}
      {totalPages > 1 && (
        <div className="teacher-carousel__dots">
          {Array.from({ length: totalPages }).map((_, i) => (
            <motion.button
              key={i}
              onClick={() => { pauseAutoPlay(); setCurrentPage(i); }}
              className={`teacher-carousel__dot ${i === currentPage ? 'teacher-carousel__dot--active' : ''}`}
              whileHover={{ scale: 1.3 }}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
