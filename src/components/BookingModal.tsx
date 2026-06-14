import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, CheckCircle, Wallet, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRequestBooking, useUpdateBookingStatus } from '../hooks/queries/useBookings';
import { useWallet } from '../hooks/queries/useWallet';
import { getOrCreateConversation } from '../lib/api/messages';
import { recordDebit } from '../lib/api/payments';
import { openCheckout, isRazorpayConfigured } from '../lib/razorpay';
import { useAuth } from '../hooks/useAuth';
import type { SkillWithTeacher } from '../types';

interface Props {
  skill: SkillWithTeacher;
  learnerId: string;
  onClose: () => void;
}

type Step = 'datetime' | 'confirm';
type PayMethod = 'wallet' | 'upi';

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function fmtDateTime(date: string, time: string) {
  if (!date || !time) return '';
  const d = new Date(`${date}T${time}`);
  return d.toLocaleString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function BookingModal({ skill, learnerId, onClose }: Props) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { profile } = useAuth();
  const { mutateAsync: requestBooking } = useRequestBooking();
  const { mutateAsync: updateStatus } = useUpdateBookingStatus();
  const { data: wallet } = useWallet(learnerId);

  const [step, setStep] = useState<Step>('datetime');
  const [date, setDate] = useState(tomorrow());
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [payMethod, setPayMethod] = useState<PayMethod>('wallet');
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const symbol = skill.currency === 'INR' ? '₹' : skill.currency;
  const scheduledAt = date && time ? new Date(`${date}T${time}`).toISOString() : '';
  const priceRupees = skill.price_per_session;
  const walletRupees = wallet ? Math.floor(wallet.balance / 100) : 0;
  const walletEnough = wallet ? wallet.balance >= priceRupees * 100 : false;

  async function handleConfirm() {
    if (!scheduledAt || paying) return;
    setError('');
    setPaying(true);
    try {
      if (payMethod === 'wallet') {
        // Pay from wallet: create the booking, then debit. If the debit fails
        // (e.g. insufficient balance), cancel the just-created booking.
        if (!walletEnough) {
          throw new Error('Not enough wallet balance. Add money or pay via UPI.');
        }
        const booking = await requestBooking({
          learner_id:   learnerId,
          teacher_id:   skill.teacher_id,
          skill_id:     skill.id,
          scheduled_at: scheduledAt,
          price:        priceRupees,
          notes:        notes.trim() || undefined,
          payment_id:   'wallet',
        });
        try {
          await recordDebit(priceRupees * 100, `Booking: ${skill.title}`, { bookingId: booking.id });
        } catch (debitErr) {
          await updateStatus({ id: booking.id, status: 'cancelled' });
          throw debitErr;
        }
      } else {
        // Pay via UPI / Razorpay: payment must succeed BEFORE the booking exists.
        const result = await openCheckout({
          amountRupees: priceRupees,
          name:         'SkillSeekho',
          description:  `Booking: ${skill.title}`,
          prefill:      { name: profile?.name ?? undefined, contact: profile?.phone ?? undefined },
        });
        if (!result) { setPaying(false); return; } // user dismissed the sheet
        await requestBooking({
          learner_id:   learnerId,
          teacher_id:   skill.teacher_id,
          skill_id:     skill.id,
          scheduled_at: scheduledAt,
          price:        priceRupees,
          notes:        notes.trim() || undefined,
          payment_id:   result.paymentId,
        });
      }
      qc.invalidateQueries({ queryKey: ['wallet', learnerId] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed. Try again.');
    } finally {
      setPaying(false);
    }
  }

  async function handleGoToMessages() {
    const convId = await getOrCreateConversation(learnerId, skill.teacher_id);
    navigate(`/messages/${convId}`);
    onClose();
  }

  return createPortal(
    <AnimatePresence>
      {/* Plain div holds z-index — motion.div with opacity animation cannot own z-index reliably */}
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
          {/* Handle bar */}
          <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5" />

          {done ? (
            // ── Success state ──────────────────────────────
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Booking Requested!
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {skill.teacher_name ?? 'The teacher'} will confirm your session shortly.
              </p>
              <button
                onClick={handleGoToMessages}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white mb-3"
                style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
              >
                Message {skill.teacher_name?.split(' ')[0] ?? 'Teacher'}
              </button>
              <button onClick={onClose} className="w-full py-3 rounded-xl text-sm font-semibold text-gray-500"
                style={{ background: '#F9FAFB' }}>
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-black" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {step === 'datetime' ? 'Pick a date & time' : 'Confirm booking'}
                  </h2>
                  <p className="text-xs text-gray-400">{skill.title} · {symbol}{skill.price_per_session}</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              {step === 'datetime' && (
                <>
                  {/* Date picker */}
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Date
                  </label>
                  <div className="relative mb-4">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={date}
                      min={todayStr()}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
                      style={{ border: '1.5px solid #E5E7EB' }}
                    />
                  </div>

                  {/* Time picker */}
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Time
                  </label>
                  <div className="relative mb-4">
                    <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
                      style={{ border: '1.5px solid #E5E7EB' }}
                    />
                  </div>

                  {skill.availability && (
                    <p className="text-xs text-gray-400 mb-5">
                      Teacher availability: <span className="text-gray-600">{skill.availability}</span>
                    </p>
                  )}

                  {/* Notes */}
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Notes <span className="font-normal normal-case">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="What do you want to learn in this session?"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none mb-5"
                    style={{ border: '1.5px solid #E5E7EB' }}
                  />

                  <button
                    onClick={() => setStep('confirm')}
                    disabled={!date || !time}
                    className="w-full py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
                  >
                    Review Booking
                  </button>
                </>
              )}

              {step === 'confirm' && (
                <>
                  {/* Summary card */}
                  <div className="rounded-2xl p-4 mb-5" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                    <p className="font-semibold text-gray-900 mb-1">{skill.title}</p>
                    <p className="text-xs text-gray-500 mb-3">with {skill.teacher_name ?? 'Teacher'}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-1.5">
                      <Calendar size={14} className="text-green-600" />
                      {fmtDateTime(date, time)}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #BBF7D0' }}>
                      <span className="text-sm text-gray-500">Session price</span>
                      <span className="font-black text-gray-900">{symbol}{skill.price_per_session}</span>
                    </div>
                  </div>

                  {notes && (
                    <p className="text-xs text-gray-400 italic mb-4">"{notes}"</p>
                  )}

                  {/* Payment method */}
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pay with</p>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <button
                      type="button"
                      onClick={() => setPayMethod('wallet')}
                      className="flex flex-col items-start gap-1.5 p-3 rounded-xl text-left transition-colors"
                      style={{
                        border: payMethod === 'wallet' ? '1.5px solid #16A34A' : '1.5px solid #E5E7EB',
                        background: payMethod === 'wallet' ? '#F0FDF4' : '#fff',
                      }}
                    >
                      <Wallet size={18} className={payMethod === 'wallet' ? 'text-green-600' : 'text-gray-400'} />
                      <span className="text-sm font-semibold text-gray-900">Wallet</span>
                      <span className={`text-xs ${walletEnough ? 'text-gray-400' : 'text-red-500'}`}>
                        Balance {symbol}{walletRupees}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPayMethod('upi')}
                      disabled={!isRazorpayConfigured()}
                      className="flex flex-col items-start gap-1.5 p-3 rounded-xl text-left transition-colors disabled:opacity-40"
                      style={{
                        border: payMethod === 'upi' ? '1.5px solid #16A34A' : '1.5px solid #E5E7EB',
                        background: payMethod === 'upi' ? '#F0FDF4' : '#fff',
                      }}
                    >
                      <Smartphone size={18} className={payMethod === 'upi' ? 'text-green-600' : 'text-gray-400'} />
                      <span className="text-sm font-semibold text-gray-900">UPI / Card</span>
                      <span className="text-xs text-gray-400">via Razorpay</span>
                    </button>
                  </div>

                  {payMethod === 'wallet' && !walletEnough && (
                    <p className="text-xs text-red-500 mb-3">
                      Wallet balance is too low. Add money from your wallet, or pay via UPI.
                    </p>
                  )}
                  {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

                  <button
                    onClick={handleConfirm}
                    disabled={paying || (payMethod === 'wallet' && !walletEnough)}
                    className="w-full py-3.5 rounded-xl text-sm font-semibold text-white mb-3 disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
                  >
                    {paying
                      ? 'Processing…'
                      : payMethod === 'wallet'
                        ? `Pay ${symbol}${priceRupees} & Book`
                        : `Pay ${symbol}${priceRupees} via UPI`}
                  </button>
                  <button
                    onClick={() => setStep('datetime')}
                    disabled={paying}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-gray-500 disabled:opacity-50"
                    style={{ background: '#F9FAFB' }}
                  >
                    Back
                  </button>
                </>
              )}
            </>
          )}
        </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
}
