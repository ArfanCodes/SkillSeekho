import { supabase } from '../supabase';
import type { Booking, BookingStatus, BookingWithDetails } from '../../types';

// ── Request a booking (learner) ───────────────

export async function requestBooking(input: {
  learner_id: string;
  teacher_id: string;
  skill_id: string;
  scheduled_at: string;   // ISO string
  price: number;          // whole rupees
  notes?: string;
  payment_id?: string;    // 'wallet' or a Razorpay payment id
}): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .insert({ ...input, status: 'requested' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Booking;
}

// ── Fetch a single booking ────────────────────

export async function getBooking(id: string): Promise<BookingWithDetails | null> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      skill:skills(title),
      learner:profiles!bookings_learner_id_fkey(name, avatar_url),
      teacher:profiles!bookings_teacher_id_fkey(name, avatar_url)
    `)
    .eq('id', id)
    .single();
  if (error) return null;
  return flattenBooking(data);
}

// ── Learner: all their bookings ───────────────

export async function getLearnerBookings(learnerId: string): Promise<BookingWithDetails[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      skill:skills(title),
      learner:profiles!bookings_learner_id_fkey(name, avatar_url),
      teacher:profiles!bookings_teacher_id_fkey(name, avatar_url)
    `)
    .eq('learner_id', learnerId)
    .order('scheduled_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(flattenBooking);
}

// ── Teacher: all bookings for their skills ────

export async function getTeacherBookings(teacherId: string): Promise<BookingWithDetails[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      skill:skills(title),
      learner:profiles!bookings_learner_id_fkey(name, avatar_url),
      teacher:profiles!bookings_teacher_id_fkey(name, avatar_url)
    `)
    .eq('teacher_id', teacherId)
    .order('scheduled_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(flattenBooking);
}

// ── Update booking status ─────────────────────

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

// Teacher accepts a booking → confirm + credit the teacher's wallet, atomically.
export async function confirmBooking(id: string): Promise<void> {
  const { error } = await supabase.rpc('confirm_booking', { p_booking_id: id });
  if (error) throw new Error(error.message);
}

// ── Internal: flatten joined response ─────────

function flattenBooking(row: Record<string, unknown>): BookingWithDetails {
  const skill  = row.skill  as { title: string } | null;
  const learner = row.learner as { name: string | null; avatar_url: string | null } | null;
  const teacher = row.teacher as { name: string | null; avatar_url: string | null } | null;
  return {
    id:           row.id as string,
    learner_id:   row.learner_id as string,
    teacher_id:   row.teacher_id as string,
    skill_id:     row.skill_id as string,
    scheduled_at: row.scheduled_at as string,
    status:       row.status as BookingStatus,
    price:        row.price as number,
    payment_id:   row.payment_id as string | null,
    notes:        row.notes as string | null,
    created_at:   row.created_at as string,
    skill_title:  skill?.title ?? '',
    learner_name: learner?.name ?? null,
    learner_avatar_url: learner?.avatar_url ?? null,
    teacher_name: teacher?.name ?? null,
    teacher_avatar_url: teacher?.avatar_url ?? null,
  };
}
