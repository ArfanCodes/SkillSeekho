import { motion } from 'framer-motion';
import { Wallet, ArrowDownLeft, TrendingUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useWallet, useTransactions } from '../../hooks/queries/useWallet';

function fmtPaise(paise: number) {
  return (paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function relativeDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ProEarnings() {
  const { profile } = useAuth();
  const { data: wallet, isLoading: walletLoading } = useWallet(profile?.id);
  const { data: transactions = [], isLoading: txLoading } = useTransactions(wallet?.id);

  const credits = transactions.filter((t) => t.type === 'credit');
  const totalEarned = credits.reduce((sum, t) => sum + t.amount, 0);
  const isLoading = walletLoading || txLoading;

  return (
    <div className="min-h-screen px-6 py-14">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Earnings</h1>
          <p className="text-gray-500">Your teaching income and payouts.</p>
        </motion.div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-5 card-shadow" style={{ border: '1px solid #F3F4F6' }}>
            <Wallet size={20} color="#22C55E" className="mb-2" />
            {walletLoading
              ? <div className="h-7 w-20 bg-gray-100 rounded animate-pulse mb-1" />
              : <p className="text-2xl font-bold text-gray-900">₹{fmtPaise(wallet?.balance ?? 0)}</p>
            }
            <p className="text-xs text-gray-500 mt-0.5">Wallet Balance</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl p-5 card-shadow" style={{ border: '1px solid #F3F4F6' }}>
            <TrendingUp size={20} color="#3B82F6" className="mb-2" />
            {isLoading
              ? <div className="h-7 w-20 bg-gray-100 rounded animate-pulse mb-1" />
              : <p className="text-2xl font-bold text-gray-900">₹{fmtPaise(totalEarned)}</p>
            }
            <p className="text-xs text-gray-500 mt-0.5">Total Earned</p>
          </motion.div>
        </div>

        {/* Credits list */}
        <h2 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Earnings History
        </h2>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl px-4 py-3.5 h-[60px] animate-pulse"
                style={{ border: '1px solid #F3F4F6' }} />
            ))}
          </div>
        )}

        {!isLoading && credits.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center card-shadow" style={{ border: '1px solid #F3F4F6' }}>
            <Wallet size={36} className="text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              No earnings yet
            </h2>
            <p className="text-sm text-gray-500">Complete your first session to see earnings here.</p>
          </div>
        )}

        <div className="space-y-3">
          {credits.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="bg-white rounded-xl px-4 py-3.5 flex items-center gap-3 card-shadow"
              style={{ border: '1px solid #F3F4F6' }}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#F0FDF4' }}>
                <ArrowDownLeft size={16} color="#22C55E" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{tx.label}</p>
                <p className="text-xs text-gray-400">{relativeDate(tx.created_at)}</p>
              </div>
              <p className="font-bold text-sm flex-shrink-0 text-green-600">+₹{fmtPaise(tx.amount)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
