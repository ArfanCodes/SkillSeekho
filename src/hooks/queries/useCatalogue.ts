import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listCategories, nearbySkills, getSkill, getTeacherSkills,
  createSkill, updateSkill, deleteSkill,
  listSkillReviews, listTeacherReviews, createReview, vouchForTeacher, unvouchTeacher,
  getCatalogueStats, listRecentReviews,
  type SkillInput,
} from '../../lib/api/catalogue';
import type { SkillFilters } from '../../types';

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: listCategories, staleTime: 1000 * 60 * 10 });
}

export function useCatalogueStats() {
  return useQuery({ queryKey: ['catalogue-stats'], queryFn: getCatalogueStats, staleTime: 1000 * 60 * 5 });
}

export function useRecentReviews(limit = 12) {
  return useQuery({ queryKey: ['recent-reviews', limit], queryFn: () => listRecentReviews(limit) });
}

export function useNearbySkills(filters: SkillFilters, enabled = true) {
  return useQuery({
    queryKey: ['skills', filters],
    queryFn: () => nearbySkills(filters),
    enabled,
  });
}

export function useSkill(id: string | undefined) {
  return useQuery({
    queryKey: ['skill', id],
    queryFn: () => getSkill(id as string),
    enabled: !!id,
  });
}

export function useTeacherSkills(teacherId: string | undefined) {
  return useQuery({
    queryKey: ['teacher-skills', teacherId],
    queryFn: () => getTeacherSkills(teacherId as string),
    enabled: !!teacherId,
  });
}

export function useSkillReviews(skillId: string | undefined) {
  return useQuery({
    queryKey: ['skill-reviews', skillId],
    queryFn: () => listSkillReviews(skillId as string),
    enabled: !!skillId,
  });
}

export function useTeacherReviews(teacherId: string | undefined) {
  return useQuery({
    queryKey: ['teacher-reviews', teacherId],
    queryFn: () => listTeacherReviews(teacherId as string),
    enabled: !!teacherId,
  });
}

// ── Mutations ─────────────────────────────────

export function useCreateSkill(teacherId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SkillInput) => createSkill(teacherId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-skills', teacherId] });
      qc.invalidateQueries({ queryKey: ['skills'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateSkill(teacherId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<SkillInput> }) => updateSkill(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-skills', teacherId] });
      qc.invalidateQueries({ queryKey: ['skills'] });
    },
  });
}

export function useDeleteSkill(teacherId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSkill(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-skills', teacherId] });
      qc.invalidateQueries({ queryKey: ['skills'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useCreateReview(skillId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['skill-reviews', skillId] });
      qc.invalidateQueries({ queryKey: ['skills'] });
      qc.invalidateQueries({ queryKey: ['skill', skillId] });
    },
  });
}

export function useVouch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teacherId, voucherId, note }: { teacherId: string; voucherId: string; note?: string }) =>
      vouchForTeacher(teacherId, voucherId, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['skills'] }),
  });
}

export function useUnvouch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teacherId, voucherId }: { teacherId: string; voucherId: string }) =>
      unvouchTeacher(teacherId, voucherId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['skills'] }),
  });
}
