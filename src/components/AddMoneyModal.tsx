import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Wallet } from 'lucide-react';
import { recordCredit } from '../lib/api/payments';
import { openCheckout } from '../lib/razorpay';
import { useAuth } from '../hooks/useAuth';

const PRESETS = [100, 250, 500, 1000];

interface Props {
  userId: string;
  onClose: () => void;
}

export default function AddMoneyModal({ userId, onClose }: Props) {
  const qc = useQueryClient();
  const { profile } = useAuth();
  const [amount, setAmount] = useState<number>(250);
  const [custom, setCustom] = useState('');
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const effective = custom ? parseInt(custom, 10) || 0 : amount;

  async function handleAdd() {
    if (paying) return;
    if (effective < 1) { setError('Enter an amount of at least ₹1.'); return; }
    setError('');
    setPaying(true);
    try {
      const result = await openCheckout({
        amountRupees: effective,
        name:         'SkillSeekho',
        description:  'Add money to wallet',
        prefill:      { name: profile?.name ?? undefined, contact: profile?.phone ?? undefined },
      });
      if (!result) { setPaying(false); return; } // dismissed

      await recordCredit(effective * 100, 'Added money to wallet', { referenceId: result.paymentId });
      qc.invalidateQueries({ queryKey: ['wallet', userId] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add money. Try again.');
    } finally {
      setPaying(false);
    }
  }

  return createPortal(
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-full bg-white rounded-t-3xl px-5 pt-4 pb-8"
            style={{ maxWidth: 640 }}
          >
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5" />

            {done ? (
              <div className="text-center py-4">
                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  ₹{effective} added!
                </h2>
                <p className="text-sm text-gray-500 mb-6">Your wallet has been topped up.</p>
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Wallet size={18} className="text-green-600" />
                    <h2 className="text-lg font-black" style={{ fontFamily: 'Outfit, sans-serif' }}>Add Money</h2>
                  </div>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4">
                  {PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => { setAmount(p); setCustom(''); }}
                      className="py-2.5 rounded-xl text-sm font-semibold transition-colors"
                      style={
                        !custom && amount === p
                          ? { background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: '#fff' }
                          : { background: '#F3F4F6', color: '#374151' }
                      }
                    >
                      ₹{p}
                    </button>
                  ))}
                </div>

                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Or enter amount
                </label>
                <div className="relative mb-5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                  <input
                    type="number"
                    min={1}
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    placeholder="Custom amount"
                    className="w-full pl-7 pr-4 py-3 rounded-xl text-sm outline-none"
                    style={{ border: '1.5px solid #E5E7EB' }}
                  />
                </div>

                {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

                <button
                  onClick={handleAdd}
                  disabled={paying || effective < 1}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
                >
                  {paying ? 'Processing…' : `Add ₹${effective} via Razorpay`}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
}
