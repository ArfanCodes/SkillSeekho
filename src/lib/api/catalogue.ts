import { supabase } from '../supabase';
import type {
  Category, Skill, SkillWithTeacher, SkillFilters, Review, Vouch,
} from '../../types';

// ── Categories ────────────────────────────────

export async function listCategories(): Promise<Category[]> {
  const [{ data: cats, error }, { data: counts }] = await Promise.all([
    supabase.from('categories').select('*').eq('active', true).order('sort_order'),
    supabase.from('category_skill_counts').select('*'),
  ]);
  if (error) throw new Error(error.message);
  const countMap = new Map((counts ?? []).map((c: { category_id: string; count: number }) => [c.category_id, c.count]));
  return (cats ?? []).map((c) => ({ ...c, count: countMap.get(c.id) ?? 0 })) as Category[];
}

// ── Skills (catalogue browse) ─────────────────

export async function nearbySkills(filters: SkillFilters = {}): Promise<SkillWithTeacher[]> {
  const { data, error } = await supabase.rpc('nearby_skills', {
    p_lat: filters.lat ?? null,
    p_lng: filters.lng ?? null,
    p_radius_km: filters.radiusKm ?? null,
    p_category: filters.categoryId ?? null,
    p_max_price: filters.maxPrice ?? null,
    p_verified_only: filters.verifiedOnly ?? false,
    p_search: filters.search ?? null,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as SkillWithTeacher[];
}

export async function getSkill(id: string): Promise<SkillWithTeacher | null> {
  // Reuse the RPC (no location) so the detail page gets the same aggregates.
  const { data, error } = await supabase.rpc('nearby_skills', { p_search: null });
  if (error) throw new Error(error.message);
  return ((data ?? []) as SkillWithTeacher[]).find((s) => s.id === id) ?? null;
}

// ── Teacher's own skills (MySkills CRUD) ──────

export async function getTeacherSkills(teacherId: string): Promise<Skill[]> {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Skill[];
}

export type SkillInput = Omit<Skill, 'id' | 'teacher_id' | 'created_at' | 'updated_at' | 'currency' | 'active'> &
  Partial<Pick<Skill, 'currency' | 'active'>>;

export async function createSkill(teacherId: string, input: SkillInput): Promise<Skill> {
  const { data, error } = await supabase
    .from('skills')
    .insert({ ...input, teacher_id: teacherId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Skill;
}

export async function updateSkill(id: string, updates: Partial<SkillInput>): Promise<Skill> {
  const { data, error } = await supabase
    .from('skills')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Skill;
}

export async function deleteSkill(id: string): Promise<void> {
  const { error } = await supabase.from('skills').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ── Reviews ───────────────────────────────────

export async function listSkillReviews(skillId: string): Promise<(Review & { learner_name: string | null })[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, learner:profiles!reviews_learner_id_fkey(name)')
    .eq('skill_id', skillId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: Review & { learner: { name: string | null } | null }) => ({
    ...r,
    learner_name: r.learner?.name ?? null,
  }));
}

export async function createReview(input: {
  skill_id: string; teacher_id: string; learner_id: string; rating: number; comment?: string;
}): Promise<Review> {
  const { data, error } = await supabase.from('reviews').insert(input).select().single();
  if (error) throw new Error(error.message);
  return data as Review;
}

// ── Vouches ───────────────────────────────────

export async function vouchForTeacher(teacherId: string, voucherId: string, note?: string): Promise<Vouch> {
  const { data, error } = await supabase
    .from('vouches')
    .insert({ teacher_id: teacherId, voucher_id: voucherId, note })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Vouch;
}

export async function unvouchTeacher(teacherId: string, voucherId: string): Promise<void> {
  const { error } = await supabase
    .from('vouches')
    .delete()
    .eq('teacher_id', teacherId)
    .eq('voucher_id', voucherId);
  if (error) throw new Error(error.message);
}

// ── Stats & community feed (Home / CommunityVouches) ──

export interface CatalogueStats {
  teachers: number;
  skills: number;
  vouches: number;
  reviews: number;
}

export async function getCatalogueStats(): Promise<CatalogueStats> {
  const head = { count: 'exact' as const, head: true };
  const [teachers, skills, vouches, reviews] = await Promise.all([
    supabase.from('profiles').select('id', head).eq('role', 'professional'),
    supabase.from('skills').select('id', head).eq('active', true),
    supabase.from('vouches').select('id', head),
    supabase.from('reviews').select('id', head),
  ]);
  return {
    teachers: teachers.count ?? 0,
    skills: skills.count ?? 0,
    vouches: vouches.count ?? 0,
    reviews: reviews.count ?? 0,
  };
}

export interface CommunityReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  learner_name: string | null;
  teacher_name: string | null;
  skill_title: string | null;
  skill_id: string;
}

export async function listRecentReviews(limit = 12): Promise<CommunityReview[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id, rating, comment, created_at, skill_id,
      learner:profiles!reviews_learner_id_fkey(name),
      teacher:profiles!reviews_teacher_id_fkey(name),
      skill:skills!reviews_skill_id_fkey(title)
    `)
    .not('comment', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  type Row = {
    id: string; rating: number; comment: string | null; created_at: string; skill_id: string;
    learner: { name: string | null } | null;
    teacher: { name: string | null } | null;
    skill: { title: string | null } | null;
  };
  return (data as unknown as Row[] ?? []).map((r) => ({
    id: r.id, rating: r.rating, comment: r.comment, created_at: r.created_at, skill_id: r.skill_id,
    learner_name: r.learner?.name ?? null,
    teacher_name: r.teacher?.name ?? null,
    skill_title: r.skill?.title ?? null,
  }));
}

// ── Cover image upload ────────────────────────

export async function uploadSkillCover(teacherId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${teacherId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('skill-covers').upload(path, file, { upsert: true });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from('skill-covers').getPublicUrl(path);
  return data.publicUrl;
}
