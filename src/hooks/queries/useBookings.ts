import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  requestBooking, getBooking, getLearnerBookings, getTeacherBookings,
  updateBookingStatus, confirmBooking,
} from '../../lib/api/bookings';
import type { BookingStatus } from '../../types';

export function useLearnerBookings(learnerId: string | undefined) {
  return useQuery({
    queryKey: ['learner-bookings', learnerId],
    queryFn:  () => getLearnerBookings(learnerId as string),
    enabled:  !!learnerId,
    staleTime: 1000 * 60,
  });
}

export function useTeacherBookings(teacherId: string | undefined) {
  return useQuery({
    queryKey: ['teacher-bookings', teacherId],
    queryFn:  () => getTeacherBookings(teacherId as string),
    enabled:  !!teacherId,
    staleTime: 1000 * 60,
  });
}

export function useBooking(id: string | undefined) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn:  () => getBooking(id as string),
    enabled:  !!id,
  });
}

export function useRequestBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: requestBooking,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['learner-bookings', vars.learner_id] });
      qc.invalidateQueries({ queryKey: ['teacher-bookings', vars.teacher_id] });
    },
  });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      updateBookingStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-bookings'] });
      qc.invalidateQueries({ queryKey: ['learner-bookings'] });
    },
  });
}

// Teacher accepts → confirm booking + wallet payout (server-side, atomic)
export function useConfirmBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => confirmBooking(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-bookings'] });
      qc.invalidateQueries({ queryKey: ['learner-bookings'] });
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
