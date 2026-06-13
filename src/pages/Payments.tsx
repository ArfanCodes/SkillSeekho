import { motion } from 'framer-motion';
import { CreditCard, ArrowUpRight, Wallet, Shield } from 'lucide-react';

const bookings = [
  { id: 1, label: 'Guitar class with Arjun Mehta',     amount: '-₹400', date: 'Yesterday, 4:00 PM', color: '#EF4444', Icon: ArrowUpRight },
  { id: 2, label: 'Yoga session with Meena Krishnan',  amount: '-₹300', date: 'Dec 8, 2025',        color: '#EF4444', Icon: ArrowUpRight },
  { id: 3, label: 'Photography basics with Priya Sharma', amount: '-₹350', date: 'Dec 6, 2025',     color: '#EF4444', Icon: ArrowUpRight },
  { id: 4, label: 'Spoken English with Ravi Kumar',    amount: '-₹500', date: 'Dec 3, 2025',        color: '#EF4444', Icon: ArrowUpRight },
  { id: 5, label: 'Biryani cooking with Arjun Mehta',  amount: '-₹450', date: 'Dec 1, 2025',        color: '#EF4444', Icon: ArrowUpRight },
];

export default function Payments() {
  return (
    <div className="min-h-screen px-6 py-14">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Your Wallet</h1>
          <p className="text-gray-500">Track earnings, sessions, and payouts.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 mb-6 text-white"
          style={{ background: 'linear-gradient(135deg, #111827, #1F2937)' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Wallet size={18} className="text-green-400" />
              <span className="text-sm text-gray-300 font-medium">SkillSeekho Wallet</span>
            </div>
            <Shield size={16} className="text-green-400" />
          </div>
          <p className="text-4xl font-black mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>₹2,450.00</p>
          <p className="text-gray-400 text-sm">Available balance</p>
          <div className="flex gap-3 mt-6">
            <button className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>Add Money</button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 mb-8">
          {[
            { label: 'Sessions Paid', value: '24',    icon: CreditCard,  color: '#3B82F6' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="bg-white rounded-2xl p-5 card-shadow" style={{ border: '1px solid #F3F4F6' }}>
              <stat.icon size={20} color={stat.color} className="mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Recent Bookings
        </h2>
        <div className="space-y-3">
          {bookings.map((bk, i) => (
            <motion.div key={bk.id} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="bg-white rounded-xl px-4 py-3.5 flex items-center gap-3 card-shadow"
              style={{ border: '1px solid #F3F4F6' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#FEF2F2' }}>
                <bk.Icon size={16} color={bk.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{bk.label}</p>
                <p className="text-xs text-gray-400">{bk.date}</p>
              </div>
              <p className="font-bold text-sm flex-shrink-0" style={{ color: bk.color }}>{bk.amount}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
