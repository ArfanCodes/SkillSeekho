import { motion } from 'framer-motion';
import { Star, Plus } from 'lucide-react';

export default function ProSkills() {
  return (
    <div className="min-h-screen px-6 py-14">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>My Skills</h1>
          <p className="text-gray-500">Manage the skills you teach and your rates.</p>
        </motion.div>
        <div className="bg-white rounded-2xl p-10 text-center card-shadow" style={{ border: '1px solid #F3F4F6' }}>
          <Star size={36} className="text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            No skills listed yet
          </h2>
          <p className="text-sm text-gray-500 mb-6">Add a skill to start receiving booking requests.</p>
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
            <Plus size={16} /> Add Skill
          </button>
        </div>
      </div>
    </div>
  );
}
