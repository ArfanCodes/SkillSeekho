import { supabase } from '../supabase';
import type {
  Category, Skill, SkillWithTeacher, SkillFilters, Review, Vouch,
} from '../../types';
import { mentors, skillCategories } from '../../utils/mockData';

// Helper to determine if we are running in local mock development mode
const checkMockMode = () => {
  return !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');
};

// ── Categories ────────────────────────────────

export async function listCategories(): Promise<Category[]> {
  if (checkMockMode()) {
    return skillCategories.map((c) => ({
      id: String(c.id),
      slug: c.name.toLowerCase(),
      name: c.name,
      icon: c.icon,
      color: c.color,
      bg: c.bg,
      image_url: c.image ?? null,
      sort_order: c.id,
      active: true,
      count: c.count,
    }));
  }

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
  if (checkMockMode()) {
    let list: SkillWithTeacher[] = mentors.map((m) => ({
      id: String(m.id),
      teacher_id: `teacher-${m.id}`,
      category_id: m.category.toLowerCase(),
      title: m.skill,
      description: m.bio,
      price_per_session: m.pricePerSession,
      currency: m.currency === '₹' ? 'INR' : m.currency,
      tags: m.tags,
      languages: m.languages,
      availability: m.availability,
      location_name: m.location,
      location_lat: 12.93 + m.id * 0.005,
      location_lng: 77.62 + m.id * 0.005,
      cover_image_url: m.photo || null,
      teacher_name: m.name,
      teacher_avatar_url: m.photo || null,
      teacher_verified: m.verified,
      avg_rating: m.rating,
      review_count: m.reviews,
      vouch_count: m.vouches,
      distance_km: parseFloat(m.distance),
    }));

    if (filters.categoryId) {
      const catId = filters.categoryId;
      const cat = skillCategories.find((c) => String(c.id) === catId || c.name.toLowerCase() === catId.toLowerCase());
      if (cat) {
        list = list.filter((item) => item.category_id === cat.name.toLowerCase());
      }
    }
    if (filters.verifiedOnly) {
      list = list.filter((item) => item.teacher_verified);
    }
    if (filters.maxPrice != null) {
      list = list.filter((item) => item.price_per_session <= filters.maxPrice!);
    }
    if (filters.search) {
      // Mirror the nearby_skills() RPC: tokenize the query and match a skill
      // when ANY meaningful word hits the title, description, a single tag,
      // the teacher name, or the location.
      const STOPWORDS = new Set([
        'the','and','near','for','with','want','need','learn','learning',
        'lesson','lessons','class','classes','teacher','teachers','coaching',
        'tuition','tutor','under','around','close','find','please','some',
        'looking','any','from','that','this','can','you','who','help',
      ]);
      const tokens = filters.search
        .toLowerCase()
        .split(/\s+/)
        .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
      if (tokens.length) {
        list = list.filter((item) => {
          const hay = [
            item.title,
            item.description ?? '',
            item.teacher_name ?? '',
            item.location_name ?? '',
            ...item.tags,
          ].join(' ').toLowerCase();
          return tokens.some((tok) => hay.includes(tok));
        });
      }
    }
    return list;
  }

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
  if (checkMockMode()) {
    const list = await nearbySkills();
    return list.find((s) => s.id === id) ?? null;
  }

  const { data, error } = await supabase.rpc('nearby_skills', { p_search: null });
  if (error) throw new Error(error.message);
  return ((data ?? []) as SkillWithTeacher[]).find((s) => s.id === id) ?? null;
}

// ── Teacher aggregate stats (dashboard) ───────

export interface TeacherStats {
  avgRating: number;
  reviewCount: number;
  vouchCount: number;
}

export async function getTeacherStats(teacherId: string): Promise<TeacherStats> {
  if (checkMockMode()) return { avgRating: 0, reviewCount: 0, vouchCount: 0 };

  const [{ data: reviews }, { data: vouch }] = await Promise.all([
    supabase.from('reviews').select('rating').eq('teacher_id', teacherId),
    supabase.from('teacher_vouch_counts').select('vouch_count').eq('teacher_id', teacherId).maybeSingle(),
  ]);

  const ratings = (reviews ?? []) as { rating: number }[];
  const avg = ratings.length
    ? Math.round((ratings.reduce((s, r) => s + r.rating, 0) / ratings.length) * 10) / 10
    : 0;

  return {
    avgRating:   avg,
    reviewCount: ratings.length,
    vouchCount:  (vouch as { vouch_count: number } | null)?.vouch_count ?? 0,
  };
}

// ── Teacher's own skills (MySkills CRUD) ──────

export async function getTeacherSkills(teacherId: string): Promise<Skill[]> {
  if (checkMockMode()) {
    return [];
  }

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

export interface TeacherReview {
  id: string;
  skill_id: string;
  teacher_id: string;
  learner_id: string;
  learner_name: string | null;
  learner_avatar_url: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  had_session: boolean; // true = reviewer completed a session with the tutor
}

const MOCK_TEACHER_REVIEWS: Record<string, TeacherReview[]> = {
  'teacher-1': [
    {
      id: 'tr-1-1', skill_id: '1', teacher_id: 'teacher-1', learner_id: 'l-1',
      learner_name: 'Ananya Roy',
      learner_avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      rating: 5,
      comment: 'Priya taught me more in 3 sessions than months of YouTube tutorials. She is patient and incredibly skilled. I already shot my first paid gig!',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      had_session: true,
    },
    {
      id: 'tr-1-2', skill_id: '1', teacher_id: 'teacher-1', learner_id: 'l-2',
      learner_name: 'Rohit Sharma',
      learner_avatar_url: null,
      rating: 5,
      comment: 'Incredible eye for composition. She helped me move from auto-mode to full manual in just 2 weeks. Highly recommend!',
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      had_session: true,
    },
    {
      id: 'tr-1-3', skill_id: '1', teacher_id: 'teacher-1', learner_id: 'l-3',
      learner_name: 'Nidhi Patel',
      learner_avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      rating: 4,
      comment: 'Very knowledgeable and professional. The post-processing tips she shared were gold. Would have liked more sessions on lighting.',
      created_at: new Date(Date.now() - 86400000 * 21).toISOString(),
      had_session: true,
    },
    {
      id: 'tr-1-4', skill_id: '1', teacher_id: 'teacher-1', learner_id: 'l-4',
      learner_name: 'Suresh Babu',
      learner_avatar_url: null,
      rating: 5,
      comment: 'I asked friends in the community about Priya and everyone vouched for her. Took a session and they were right — absolutely world-class!',
      created_at: new Date(Date.now() - 86400000 * 35).toISOString(),
      had_session: false,
    },
  ],
  'teacher-2': [
    {
      id: 'tr-2-1', skill_id: '2', teacher_id: 'teacher-2', learner_id: 'l-5',
      learner_name: 'Deepak Iyer',
      learner_avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      rating: 5,
      comment: "The dum biryani recipe was a family secret he graciously shared. My family couldn't believe I cooked it. Arjun is a master teacher.",
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
      had_session: true,
    },
    {
      id: 'tr-2-2', skill_id: '2', teacher_id: 'teacher-2', learner_id: 'l-6',
      learner_name: 'Pooja Rao',
      learner_avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150',
      rating: 5,
      comment: 'His passion for cooking is infectious. I came in knowing nothing about biryani and left with a skill I can use for life. The spice blending session was 10/10.',
      created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
      had_session: true,
    },
    {
      id: 'tr-2-3', skill_id: '2', teacher_id: 'teacher-2', learner_id: 'l-7',
      learner_name: 'Vikram Singh',
      learner_avatar_url: null,
      rating: 5,
      comment: 'Arjun has deep culinary roots. He goes beyond recipes and teaches you the "why" behind every step. Exceptional experience!',
      created_at: new Date(Date.now() - 86400000 * 28).toISOString(),
      had_session: true,
    },
  ],
  'teacher-3': [
    {
      id: 'tr-3-1', skill_id: '3', teacher_id: 'teacher-3', learner_id: 'l-8',
      learner_name: 'Lakshmi Narayanan',
      learner_avatar_url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150',
      rating: 5,
      comment: 'Meena aunty is a gem. She fixed my blouse pattern in 20 minutes and then spent an hour teaching me how to do it myself. Truly neighbourhood gold!',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      had_session: true,
    },
    {
      id: 'tr-3-2', skill_id: '3', teacher_id: 'teacher-3', learner_id: 'l-9',
      learner_name: 'Kavya Reddy',
      learner_avatar_url: null,
      rating: 5,
      comment: 'I wanted to learn to stitch my own kurtas. After 4 sessions with Meena, I completed my first one. The fit was perfect. She is incredibly patient and thorough.',
      created_at: new Date(Date.now() - 86400000 * 18).toISOString(),
      had_session: true,
    },
    {
      id: 'tr-3-3', skill_id: '3', teacher_id: 'teacher-3', learner_id: 'l-10',
      learner_name: 'Preethi Suresh',
      learner_avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      rating: 4,
      comment: 'Very skilled in traditional techniques. I especially loved the saree draping session. Would love if she added more western fashion content.',
      created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      had_session: true,
    },
  ],
  'teacher-4': [
    {
      id: 'tr-4-1', skill_id: '4', teacher_id: 'teacher-4', learner_id: 'l-11',
      learner_name: 'Fatima Khan',
      learner_avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      rating: 5,
      comment: 'I was terrified of speaking in meetings. After 2 months with Ravi, I presented to 50 people and got a promotion. Life-changing!',
      created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
      had_session: true,
    },
    {
      id: 'tr-4-2', skill_id: '4', teacher_id: 'teacher-4', learner_id: 'l-12',
      learner_name: 'Mohammed Ashfaq',
      learner_avatar_url: null,
      rating: 5,
      comment: 'Ravi has a unique method — he records your speech and plays it back for improvement. That technique alone transformed my accent and confidence.',
      created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
      had_session: true,
    },
    {
      id: 'tr-4-3', skill_id: '4', teacher_id: 'teacher-4', learner_id: 'l-13',
      learner_name: 'Shivani Agarwal',
      learner_avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      rating: 4,
      comment: 'Great teacher, very structured curriculum. My interview English improved dramatically. I wish he had weekend slots too.',
      created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
      had_session: true,
    },
  ],
  'teacher-5': [
    {
      id: 'tr-5-1', skill_id: '5', teacher_id: 'teacher-5', learner_id: 'l-14',
      learner_name: 'Aishwarya Menon',
      learner_avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      rating: 5,
      comment: 'Sunita transformed my mornings. I used to wake up dreading the day — now I start with 30 minutes of Hatha and feel unstoppable. She is genuinely gifted.',
      created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
      had_session: true,
    },
    {
      id: 'tr-5-2', skill_id: '5', teacher_id: 'teacher-5', learner_id: 'l-15',
      learner_name: 'Gautam Nair',
      learner_avatar_url: null,
      rating: 5,
      comment: 'I have tried yoga apps, online videos, gym classes — nothing clicked until Sunita. Her in-person guidance for posture is irreplaceable. 5 stars every time.',
      created_at: new Date(Date.now() - 86400000 * 22).toISOString(),
      had_session: true,
    },
    {
      id: 'tr-5-3', skill_id: '5', teacher_id: 'teacher-5', learner_id: 'l-16',
      learner_name: 'Tejaswi Rao',
      learner_avatar_url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150',
      rating: 5,
      comment: 'The pranayama breathing techniques she taught me help me manage anxiety daily. I cannot put a price on this skill.',
      created_at: new Date(Date.now() - 86400000 * 40).toISOString(),
      had_session: false,
    },
  ],
  'teacher-6': [
    {
      id: 'tr-6-1', skill_id: '6', teacher_id: 'teacher-6', learner_id: 'l-17',
      learner_name: 'Aryan Kapoor',
      learner_avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      rating: 5,
      comment: 'Kabir is the kind of teacher who makes you fall in love with music all over again. I learnt fingerpicking in the very first session. Truly inspiring!',
      created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
      had_session: true,
    },
    {
      id: 'tr-6-2', skill_id: '6', teacher_id: 'teacher-6', learner_id: 'l-18',
      learner_name: 'Siddharth Joshi',
      learner_avatar_url: null,
      rating: 4,
      comment: 'Excellent classical foundation. He taught me the basics of music theory which I never learnt before, and now it all makes sense. Scheduling could be more flexible.',
      created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
      had_session: true,
    },
    {
      id: 'tr-6-3', skill_id: '6', teacher_id: 'teacher-6', learner_id: 'l-19',
      learner_name: 'Riya Malhotra',
      learner_avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
      rating: 5,
      comment: 'I wanted to learn Bollywood songs for a wedding performance. Kabir prepared a full set list and we nailed it! The crowd loved the performance!',
      created_at: new Date(Date.now() - 86400000 * 50).toISOString(),
      had_session: true,
    },
  ],
};

export async function listTeacherReviews(teacherId: string): Promise<TeacherReview[]> {
  if (checkMockMode()) {
    return MOCK_TEACHER_REVIEWS[teacherId] ?? [];
  }

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id, skill_id, teacher_id, learner_id, rating, comment, created_at,
      learner:profiles!reviews_learner_id_fkey(name, avatar_url)
    `)
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  type Row = {
    id: string; skill_id: string; teacher_id: string; learner_id: string;
    rating: number; comment: string | null; created_at: string;
    learner: { name: string | null; avatar_url: string | null } | null;
  };
  return (data as unknown as Row[] ?? []).map((r) => ({
    id: r.id, skill_id: r.skill_id, teacher_id: r.teacher_id, learner_id: r.learner_id,
    rating: r.rating, comment: r.comment, created_at: r.created_at,
    learner_name: r.learner?.name ?? null,
    learner_avatar_url: r.learner?.avatar_url ?? null,
    had_session: true,
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
  if (checkMockMode()) {
    return {
      teachers: 12400,
      skills: 340,
      vouches: 89200,
      reviews: 2100,
    };
  }

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
  learner_avatar_url: string | null;
  teacher_name: string | null;
  skill_title: string | null;
  skill_id: string;
}

export async function listRecentReviews(limit = 12): Promise<CommunityReview[]> {
  if (checkMockMode()) {
    return [
      {
        id: 'mock-rev-1',
        rating: 5,
        comment: 'Priya taught me more in 3 sessions than months of YouTube tutorials. She is patient and incredibly skilled. I already shot my first paid gig!',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        learner_name: 'Ananya Roy',
        learner_avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        teacher_name: 'Priya Sharma',
        skill_title: 'Photography',
        skill_id: '1'
      },
      {
        id: 'mock-rev-2',
        rating: 5,
        comment: "The dum biryani recipe was a family secret he graciously shared. My family couldn't believe I cooked it. Arjun is a master teacher.",
        created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        learner_name: 'Deepak Iyer',
        learner_avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        teacher_name: 'Arjun Mehta',
        skill_title: 'Biryani Making',
        skill_id: '2'
      },
      {
        id: 'mock-rev-3',
        rating: 5,
        comment: 'I was terrified of speaking in meetings. After 2 months with Ravi, I presented to 50 people and got a promotion. Life-changing!',
        created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
        learner_name: 'Fatima Khan',
        learner_avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        teacher_name: 'Ravi Nair',
        skill_title: 'Spoken English',
        skill_id: '4'
      }
    ].slice(0, limit);
  }

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id, rating, comment, created_at, skill_id,
      learner:profiles!reviews_learner_id_fkey(name, avatar_url),
      teacher:profiles!reviews_teacher_id_fkey(name),
      skill:skills!reviews_skill_id_fkey(title)
    `)
    .not('comment', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  type Row = {
    id: string; rating: number; comment: string | null; created_at: string; skill_id: string;
    learner: { name: string | null; avatar_url: string | null } | null;
    teacher: { name: string | null } | null;
    skill: { title: string | null } | null;
  };
  return (data as unknown as Row[] ?? []).map((r) => ({
    id: r.id, rating: r.rating, comment: r.comment, created_at: r.created_at, skill_id: r.skill_id,
    learner_name: r.learner?.name ?? null,
    learner_avatar_url: r.learner?.avatar_url ?? null,
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
