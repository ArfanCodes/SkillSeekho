import { motion } from 'framer-motion';
import { PlusSquare } from 'lucide-react';

export default function EmpPostJob() {
  return (
    <div className="min-h-screen px-6 py-14">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Post a Job</h1>
          <p className="text-gray-500">Reach verified skill professionals in your area.</p>
        </motion.div>
        <div className="bg-white rounded-2xl p-10 text-center card-shadow" style={{ border: '1px solid #F3F4F6' }}>
          <PlusSquare size={36} className="text-green-400 mx-auto mb-4" />
          <p className="text-sm text-gray-500">Job posting form — coming in Phase 6.</p>
        </div>
      </div>
    </div>
  );
}
