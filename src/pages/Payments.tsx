import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Wallet, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useWallet, useTransactions } from '../hooks/queries/useWallet';
import AddMoneyModal from '../components/AddMoneyModal';

function fmtPaise(paise: number) {
  return (paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function relativeDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return `Today, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  if (diffDays === 1) return `Yesterday, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Payments() {
  const { profile } = useAuth();
  const { data: wallet, isLoading: walletLoading } = useWallet(profile?.id);
  const { data: transactions = [], isLoading: txLoading } = useTransactions(wallet?.id);

  const sessionsPaid = transactions.filter((t) => t.type === 'debit').length;
  const isLoading = walletLoading || txLoading;
  const [showAddMoney, setShowAddMoney] = useState(false);

  return (
    <div className="min-h-screen px-6 py-14">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Your Wallet</h1>
          <p className="text-gray-500">Track earnings, sessions, and payouts.</p>
        </motion.div>

        {/* Wallet card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 mb-6 text-white"
          style={{ background: 'linear-gradient(135deg, #111827, #1F2937)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Wallet size={18} className="text-green-400" />
              <span className="text-sm text-gray-300 font-medium">SkillSeekho Wallet</span>
            </div>
            <Shield size={16} className="text-green-400" />
          </div>

          {walletLoading ? (
            <div className="h-10 w-32 bg-white/10 rounded-lg animate-pulse mb-1" />
          ) : (
            <p className="text-4xl font-black mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
              ₹{wallet ? fmtPaise(wallet.balance) : '0.00'}
            </p>
          )}
          <p className="text-gray-400 text-sm">Available balance</p>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowAddMoney(true)}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
            >
              Add Money
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 card-shadow mb-8"
          style={{ border: '1px solid #F3F4F6' }}
        >
          <CreditCard size={20} color="#3B82F6" className="mb-2" />
          {txLoading ? (
            <div className="h-7 w-10 bg-gray-100 rounded animate-pulse mb-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900">{sessionsPaid}</p>
          )}
          <p className="text-xs text-gray-500 mt-0.5">Sessions Paid</p>
        </motion.div>

        {/* Transaction list */}
        <h2 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Recent Transactions
        </h2>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl px-4 py-3.5 h-[60px] animate-pulse"
                style={{ border: '1px solid #F3F4F6' }} />
            ))}
          </div>
        )}

        {!isLoading && transactions.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No transactions yet.</p>
        )}

        <div className="space-y-3">
          {transactions.map((tx, i) => {
            const isDebit = tx.type === 'debit';
            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-xl px-4 py-3.5 flex items-center gap-3 card-shadow"
                style={{ border: '1px solid #F3F4F6' }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: isDebit ? '#FEF2F2' : '#F0FDF4' }}
                >
                  {isDebit
                    ? <ArrowUpRight size={16} color="#EF4444" />
                    : <ArrowDownLeft size={16} color="#22C55E" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{tx.label}</p>
                  <p className="text-xs text-gray-400">{relativeDate(tx.created_at)}</p>
                </div>
                <p className="font-bold text-sm flex-shrink-0" style={{ color: isDebit ? '#EF4444' : '#22C55E' }}>
                  {isDebit ? '-' : '+'}₹{fmtPaise(tx.amount)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {showAddMoney && profile && (
          <AddMoneyModal userId={profile.id} onClose={() => setShowAddMoney(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
