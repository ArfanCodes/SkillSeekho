import { motion } from 'framer-motion';
import { LayoutDashboard, CalendarCheck, Wallet, Star, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function ProDashboard() {
  const { profile } = useAuth();

  const stats = [
    { label: 'Total Earnings', value: '₹0', icon: Wallet, color: '#22C55E' },
    { label: 'Bookings', value: '0', icon: CalendarCheck, color: '#3B82F6' },
    { label: 'Rating', value: '—', icon: Star, color: '#F59E0B' },
    { label: 'Vouches', value: '0', icon: Users, color: '#EC4899' },
  ];

  return (
    <div className="min-h-screen px-6 py-14">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Welcome, {profile?.name?.split(' ')[0] ?? 'Teacher'} 👋
          </h1>
          <p className="text-gray-500">Here's your teaching overview.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-10">
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

        {/* Empty state */}
        <div className="bg-white rounded-2xl p-10 text-center card-shadow" style={{ border: '1px solid #F3F4F6' }}>
          <TrendingUp size={36} className="text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Add your skills to get started
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            List what you teach, set your price, and learners nearby will find you.
          </p>
          <button className="px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
            Add My First Skill
          </button>
        </div>
      </div>
    </div>
  );
}
