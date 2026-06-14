import { motion } from 'framer-motion';
import { Wallet, ArrowDownLeft, TrendingUp, Eye, Key, DollarSign } from 'lucide-react';
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

        <div className="space-y-3 mb-14">
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

        {/* ── ROYALTY DASHBOARD PREVIEW ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Royalty Dashboard Preview
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              A preview of your archive royalties, active licenses, and upcoming automated payouts.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-gray-900 p-5 px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded">
                  PORTAL DEMO
                </span>
                <h4 className="font-bold text-base mt-2" style={{ color: '#ffffff' }}>
                  {profile?.name ?? 'Your Name'} — Heritage Skill Practitioner
                </h4>
                <p className="text-xs text-gray-400 font-medium">Practitioner ID: #983-ART-KTL</p>
              </div>
              <span className="text-xs bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-slate-300 font-medium">
                Verified Wallet Connected
              </span>
            </div>

            {/* Stats */}
            <div className="p-6 grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Archive Views',     val: '14,820',  sub: '+12.4% this month',             icon: <Eye size={15} /> },
                { label: 'Active Licenses',   val: '8',       sub: '3 universities, 5 design firms', icon: <Key size={15} /> },
                { label: 'Royalty Earnings',  val: '₹24,500', sub: '80% split rate active',          icon: <Wallet size={15} /> },
                { label: 'Upcoming Payouts',  val: '₹4,200',  sub: 'Disburses in 3 days',            icon: <DollarSign size={15} /> },
                { label: 'Engagement Growth', val: '+18.2%',  sub: 'Avg 4.8 min watch duration',     icon: <TrendingUp size={15} /> },
              ].map((stat) => (
                <div key={stat.label} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{stat.label}</span>
                    <div className="text-gray-400">{stat.icon}</div>
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-gray-800 tracking-tight">{stat.val}</p>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">{stat.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Transactions table */}
            <div className="border-t border-gray-100 p-6 bg-gray-50/50">
              <h5 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-4">
                Recent Automatic Disbursements
              </h5>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-500 font-medium min-w-[480px]">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400">
                      <th className="py-2.5 font-bold">Transaction Hash</th>
                      <th className="py-2.5 font-bold">Skill Archive Title</th>
                      <th className="py-2.5 font-bold">Source</th>
                      <th className="py-2.5 font-bold">Payout</th>
                      <th className="py-2.5 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 text-gray-700">
                      <td className="py-3 font-mono text-emerald-600">0x8a92f...b3c</td>
                      <td>Terracotta Pitcher Sculpting (V1)</td>
                      <td>National Design Academy</td>
                      <td className="font-bold">₹12,000</td>
                      <td><span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-100">Paid</span></td>
                    </tr>
                    <tr className="border-b border-gray-100 text-gray-700">
                      <td className="py-3 font-mono text-emerald-600">0x2f90a...d8e</td>
                      <td>Wheel Centering Fundamentals</td>
                      <td>Public Streaming (Views pool)</td>
                      <td className="font-bold">₹8,300</td>
                      <td><span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-100">Paid</span></td>
                    </tr>
                    <tr className="text-gray-700">
                      <td className="py-3 font-mono text-emerald-600">0x5c72e...e9f</td>
                      <td>Clay Mixing &amp; Maturation Ratio</td>
                      <td>Craft Design Studio</td>
                      <td className="font-bold">₹4,200</td>
                      <td><span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-100">Upcoming</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
