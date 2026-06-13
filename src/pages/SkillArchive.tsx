import { motion } from 'framer-motion';
import { Archive, Search, Filter } from 'lucide-react';
import { skillCategories, mentors } from '../utils/mockData';
import SkillCarousel from '../components/SkillCarousel';
import TeacherCarousel from '../components/TeacherCarousel';

export default function SkillArchive() {
  return (
    <div className="min-h-screen py-14">
      <div className="px-6 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-green-700 uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <Archive size={13} /> Skill Archive
          </span>
          <h1 className="text-4xl font-black mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Every skill, archived.
          </h1>
          <p className="text-gray-500">Browse 340+ skills taught by verified local experts.</p>
        </motion.div>

        <div className="flex gap-3 mb-10">
          <div className="flex-1 flex items-center bg-white rounded-xl px-4 py-2.5 gap-2"
            style={{ border: '1px solid #E5E7EB' }}>
            <Search size={16} className="text-gray-400" />
            <input className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400 bg-transparent"
              placeholder="Search skills or teachers…" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-sm font-medium text-gray-600"
            style={{ border: '1px solid #E5E7EB' }}>
            <Filter size={15} /> Filter
          </button>
        </div>
      </div>

      <div className="mb-14">
        <SkillCarousel skills={skillCategories} title="All Categories" subtitle="Browse by skill type" />
      </div>

      <TeacherCarousel teachers={mentors} title="All Teachers" subtitle="Verified local experts across all skills" />
    </div>
  );
}
