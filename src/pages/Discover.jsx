import { motion } from 'framer-motion';
import { Compass, SlidersHorizontal, TrendingUp } from 'lucide-react';
import TeacherCarousel from '../components/TeacherCarousel';
import SkillCarousel from '../components/SkillCarousel';
import { mentors, skillCategories } from '../utils/mockData';

export default function Discover() {
  return (
    <div className="min-h-screen py-14">
      <div className="px-6 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-green-700 uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <Compass size={13} /> Discover
          </span>
          <h1 className="text-4xl font-black mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Discover Skills Near You
          </h1>
          <p className="text-gray-500 text-lg">Explore teachers, trending skills and local sessions.</p>
        </motion.div>

        {/* Trending */}
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-green-600" />
          <h2 className="font-bold text-gray-900">Trending this week</h2>
        </div>
        <div className="flex flex-wrap gap-2 mb-10">
          {['Biryani Making', 'Spoken English', 'Guitar', 'Yoga', 'Photography', 'Tailoring'].map((s) => (
            <button key={s} className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
              style={{ backgroundColor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Skill Categories Carousel */}
      <div className="mb-12">
        <SkillCarousel
          skills={skillCategories}
          title="Explore Categories"
          subtitle="Browse by skill type"
        />
      </div>

      {/* Teacher Carousel */}
      <TeacherCarousel
        teachers={mentors}
        title="All Teachers"
        headerRight={
          <button className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-gray-300 transition-colors">
            <SlidersHorizontal size={14} /> Filters
          </button>
        }
      />
    </div>
  );
}
