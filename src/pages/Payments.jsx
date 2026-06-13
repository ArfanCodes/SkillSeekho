import { motion } from 'framer-motion';
import { CreditCard, TrendingUp, ArrowDownLeft, ArrowUpRight, Wallet, Shield } from 'lucide-react';

const transactions = [
  { id: 1, type: 'credit', label: 'Session with Priya Sharma', amount: '+₹350', date: 'Today, 10:30 AM', icon: ArrowDownLeft, color: '#22C55E' },
  { id: 2, type: 'debit', label: 'Booking: Guitar class', amount: '-₹400', date: 'Yesterday, 4:00 PM', icon: ArrowUpRight, color: '#EF4444' },
  { id: 3, type: 'credit', label: 'Referral bonus', amount: '+₹100', date: 'Dec 10, 2025', icon: ArrowDownLeft, color: '#22C55E' },
  { id: 4, type: 'debit', label: 'Yoga session booking', amount: '-₹300', date: 'Dec 8, 2025', icon: ArrowUpRight, color: '#EF4444' },
  { id: 5, type: 'credit', label: 'Teaching earnings', amount: '+₹750', date: 'Dec 6, 2025', icon: ArrowDownLeft, color: '#22C55E' },
];

export default function Payments() {
  return (
    <div className="min-h-screen px-6 py-14">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-green-700 uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <CreditCard size={13} /> Payments
          </span>
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Your Wallet</h1>
          <p className="text-gray-500">Track earnings, sessions, and payouts.</p>
        </motion.div>

        {/* Balance card */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 mb-6 text-white"
          style={{ background: 'linear-gradient(135deg, #111827, #1F2937)' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Wallet size={18} className="text-green-400" />
              <span className="text-sm text-gray-300 font-medium">NearNative Wallet</span>
            </div>
            <Shield size={16} className="text-green-400" />
          </div>
          <p className="text-4xl font-black mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>₹2,450.00</p>
          <p className="text-gray-400 text-sm">Available balance</p>
          <div className="flex gap-3 mt-6">
            <button className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>Add Money</button>
            <button className="flex-1 py-2.5 rounded-xl font-semibold text-sm border border-gray-600 text-gray-300 hover:border-gray-400 transition-colors">
              Withdraw
            </button>
          </div>
        </motion.div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { label: 'Total Earned', value: '₹8,200', icon: TrendingUp, color: '#22C55E' },
            { label: 'Sessions Paid', value: '24', icon: CreditCard, color: '#3B82F6' },
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

        {/* Transactions */}
        <h2 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Recent Transactions</h2>
        <div className="space-y-3">
          {transactions.map((tx, i) => (
            <motion.div key={tx.id} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="bg-white rounded-xl px-4 py-3.5 flex items-center gap-3 card-shadow"
              style={{ border: '1px solid #F3F4F6' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: tx.type === 'credit' ? '#F0FDF4' : '#FEF2F2' }}>
                <tx.icon size={16} color={tx.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{tx.label}</p>
                <p className="text-xs text-gray-400">{tx.date}</p>
              </div>
              <p className="font-bold text-sm flex-shrink-0" style={{ color: tx.color }}>{tx.amount}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
