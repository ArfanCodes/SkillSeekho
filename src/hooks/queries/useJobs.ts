import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createJob, updateJob, deleteJob, getEmployerJobs,
  listOpenJobs, applyToJob, getJobApplications, setApplicationStatus,
  type JobInput,
} from '../../lib/api/jobs';
import type { ApplicationStatus } from '../../types';

export function useEmployerJobs(employerId: string | undefined) {
  return useQuery({
    queryKey: ['employer-jobs', employerId],
    queryFn:  () => getEmployerJobs(employerId as string),
    enabled:  !!employerId,
  });
}

export function useOpenJobs(viewerId: string | undefined) {
  return useQuery({
    queryKey: ['open-jobs', viewerId],
    queryFn:  () => listOpenJobs(viewerId),
  });
}

export function useJobApplications(jobId: string | undefined) {
  return useQuery({
    queryKey: ['job-applications', jobId],
    queryFn:  () => getJobApplications(jobId as string),
    enabled:  !!jobId,
  });
}

export function useCreateJob(employerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: JobInput) => createJob(employerId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employer-jobs', employerId] }),
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<JobInput & { status: 'open' | 'closed' }> }) =>
      updateJob(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employer-jobs'] });
      qc.invalidateQueries({ queryKey: ['open-jobs'] });
    },
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteJob(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employer-jobs'] }),
  });
}

export function useApplyToJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, teacherId, note }: { jobId: string; teacherId: string; note: string }) =>
      applyToJob(jobId, teacherId, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['open-jobs'] }),
  });
}

export function useSetApplicationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      setApplicationStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['job-applications'] }),
  });
}
