import { motion } from 'framer-motion';
import { CalendarDays, CheckCircle, XCircle, MessageSquare, Clock } from 'lucide-react';
import type { BookingWithDetails, BookingStatus } from '../types';

const STATUS_STYLES: Record<BookingStatus, { label: string; bg: string; color: string }> = {
  requested:  { label: 'Pending',    bg: '#FEF9C3', color: '#92400E' },
  confirmed:  { label: 'Confirmed',  bg: '#DCFCE7', color: '#166534' },
  completed:  { label: 'Completed',  bg: '#DBEAFE', color: '#1E40AF' },
  cancelled:  { label: 'Cancelled',  bg: '#FEE2E2', color: '#991B1B' },
};

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}

function initials(name: string | null) {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

interface Props {
  booking: BookingWithDetails;
  /** Teacher view: show Accept/Cancel buttons when status=requested */
  teacherView?: boolean;
  onAccept?: (id: string) => void;
  onCancel?: (id: string) => void;
  onMessage?: (teacherId: string, learnerId: string) => void;
  index?: number;
}

export default function BookingCard({
  booking, teacherView, onAccept, onCancel, onMessage, index = 0,
}: Props) {
  const { label, bg, color } = STATUS_STYLES[booking.status];
  const otherName = teacherView ? booking.learner_name : booking.teacher_name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-white rounded-2xl p-4 card-shadow"
      style={{ border: '1px solid #F3F4F6' }}
    >
      {/* Header row */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
        >
          {initials(otherName)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 truncate">
            {booking.skill_title}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {teacherView ? `with ${booking.learner_name ?? 'Learner'}` : `by ${booking.teacher_name ?? 'Teacher'}`}
          </p>
        </div>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: bg, color }}
        >
          {label}
        </span>
      </div>

      {/* Date & price */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <span className="flex items-center gap-1">
          <CalendarDays size={13} /> {fmt(booking.scheduled_at)}
        </span>
        <span className="font-semibold text-gray-700">₹{booking.price}</span>
      </div>

      {booking.notes && (
        <p className="text-xs text-gray-400 italic mb-3 line-clamp-2">"{booking.notes}"</p>
      )}

      {/* Action buttons */}
      {teacherView && booking.status === 'requested' && (
        <div className="flex gap-2">
          <button
            onClick={() => onAccept?.(booking.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
          >
            <CheckCircle size={14} /> Accept
          </button>
          <button
            onClick={() => onCancel?.(booking.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
            style={{ background: '#FEE2E2', color: '#991B1B' }}
          >
            <XCircle size={14} /> Decline
          </button>
        </div>
      )}

      {!teacherView && booking.status === 'confirmed' && (
        <button
          onClick={() => onMessage?.(booking.teacher_id, booking.learner_id)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
          style={{ background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}
        >
          <MessageSquare size={14} /> Message Teacher
        </button>
      )}

      {teacherView && booking.status === 'confirmed' && (
        <button
          onClick={() => onMessage?.(booking.teacher_id, booking.learner_id)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
          style={{ background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}
        >
          <MessageSquare size={14} /> Message Learner
        </button>
      )}

      {booking.status === 'requested' && !teacherView && (
        <div className="flex items-center gap-1.5 text-xs text-amber-600">
          <Clock size={13} /> Waiting for teacher to confirm
        </div>
      )}
    </motion.div>
  );
}
