import { motion } from 'framer-motion';
import { ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmpJobs() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen px-6 py-14">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>My Jobs</h1>
          <p className="text-gray-500">Job postings you've created.</p>
        </motion.div>
        <div className="bg-white rounded-2xl p-10 text-center card-shadow" style={{ border: '1px solid #F3F4F6' }}>
          <ListChecks size={36} className="text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>No jobs posted yet</h2>
          <p className="text-sm text-gray-500 mb-6">Post your first job to start receiving applications.</p>
          <button onClick={() => navigate('/employer/post')}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
            Post a Job
          </button>
        </div>
      </div>
    </div>
  );
}
