import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import TeacherCarousel from '../../components/TeacherCarousel';
import { mentors } from '../../utils/mockData';

export default function EmpTeachers() {
  return (
    <div className="min-h-screen py-14">
      <div className="px-6 max-w-5xl mx-auto mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Hire verified professionals</h1>
          <p className="text-gray-500">Browse skill experts you can hire directly.</p>
        </motion.div>
      </div>
      <TeacherCarousel teachers={mentors} title="All Verified Teachers" />
    </div>
  );
}
