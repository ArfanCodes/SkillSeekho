import { motion } from 'framer-motion';
import { LayoutDashboard, ListChecks, Users, PlusSquare, TrendingUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function EmpDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { label: 'Active Jobs', value: '0', icon: ListChecks, color: '#F59E0B' },
    { label: 'Applications', value: '0', icon: Users, color: '#3B82F6' },
    { label: 'Teachers Found', value: '0', icon: TrendingUp, color: '#22C55E' },
  ];

  return (
    <div className="min-h-screen px-6 py-14">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-green-700 uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <LayoutDashboard size={13} /> Employer
          </span>
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Welcome, {profile?.company_name ?? profile?.name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="text-gray-500">Find and hire verified skill professionals.</p>
        </motion.div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-5 card-shadow" style={{ border: '1px solid #F3F4F6' }}>
              <s.icon size={20} color={s.color} className="mb-2" />
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-10 text-center card-shadow" style={{ border: '1px solid #F3F4F6' }}>
          <PlusSquare size={36} className="text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Post your first job
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Reach thousands of verified skill professionals. Post in under 2 minutes.
          </p>
          <button onClick={() => navigate('/employer/post')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
            <PlusSquare size={16} /> Post a Job
          </button>
        </div>
      </div>
    </div>
  );
}
