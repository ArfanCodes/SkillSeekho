import { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { CalendarCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTeacherBookings, useUpdateBookingStatus } from '../../hooks/queries/useBookings';
import { getOrCreateConversation } from '../../lib/api/messages';
import BookingCard from '../../components/BookingCard';
import type { BookingStatus } from '../../types';

const TABS: { label: string; value: BookingStatus | 'all' }[] = [
  { label: 'All',       value: 'all' },
  { label: 'Pending',   value: 'requested' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
];

export default function ProBookings() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { data: bookings = [], isLoading } = useTeacherBookings(profile?.id);
  const { mutate: updateStatus } = useUpdateBookingStatus();
  const [tab, setTab] = useState<BookingStatus | 'all'>('all');

  const filtered = tab === 'all' ? bookings : bookings.filter((b) => b.status === tab);
  const pendingCount = bookings.filter((b) => b.status === 'requested').length;

  async function handleMessage(teacherId: string, learnerId: string) {
    const convId = await getOrCreateConversation(teacherId, learnerId);
    navigate(`/messages/${convId}`);
  }

  return (
    <div className="min-h-screen px-6 py-14">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Manage Bookings
              </h1>
              <p className="text-gray-500">Incoming session requests from learners.</p>
            </div>
            {pendingCount > 0 && (
              <span className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white"
                style={{ background: '#EF4444' }}>
                {pendingCount}
              </span>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className="px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors"
              style={
                tab === t.value
                  ? { background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: '#fff' }
                  : { background: '#F3F4F6', color: '#6B7280' }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 h-28 animate-pulse"
                style={{ border: '1px solid #F3F4F6' }} />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center card-shadow" style={{ border: '1px solid #F3F4F6' }}>
            <CalendarCheck size={36} className="text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {tab === 'all' ? 'No bookings yet' : `No ${tab} bookings`}
            </h2>
            <p className="text-sm text-gray-500">
              {tab === 'all' ? 'Add your skills so learners can find and book you.' : 'Nothing here right now.'}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((booking, i) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              teacherView
              index={i}
              onAccept={(id) => updateStatus({ id, status: 'confirmed' })}
              onCancel={(id) => updateStatus({ id, status: 'cancelled' })}
              onMessage={handleMessage}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
