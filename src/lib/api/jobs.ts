import { supabase } from '../supabase';
import type {
  JobPosting, JobWithMeta, JobApplicationWithTeacher,
  JobPostingType, ApplicationStatus,
} from '../../types';

export interface JobInput {
  title: string;
  description: string | null;
  category_id: string | null;
  job_type: JobPostingType;
  pay_min: number | null;
  pay_max: number | null;
  location_name: string | null;
}

// ── Employer: create / manage ─────────────────

export async function createJob(employerId: string, input: JobInput): Promise<JobPosting> {
  const { data, error } = await supabase
    .from('jobs')
    .insert({ ...input, employer_id: employerId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as JobPosting;
}

export async function updateJob(id: string, updates: Partial<JobInput & { status: 'open' | 'closed' }>): Promise<void> {
  const { error } = await supabase.from('jobs').update(updates).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteJob(id: string): Promise<void> {
  const { error } = await supabase.from('jobs').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// Employer's own jobs, with application counts
export async function getEmployerJobs(employerId: string): Promise<JobWithMeta[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select(`*, category:categories(name), applications:job_applications(id)`)
    .eq('employer_id', employerId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: Record<string, unknown>) => flattenJob(row, null));
}

// ── Teacher / public: browse open jobs ────────

export async function listOpenJobs(viewerId?: string): Promise<JobWithMeta[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      employer:profiles!jobs_employer_id_fkey(name, company_name),
      category:categories(name),
      applications:job_applications(id, teacher_id, status)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: Record<string, unknown>) => flattenJob(row, viewerId ?? null));
}

// ── Applications ──────────────────────────────

export async function applyToJob(jobId: string, teacherId: string, note: string): Promise<void> {
  const { error } = await supabase
    .from('job_applications')
    .insert({ job_id: jobId, teacher_id: teacherId, note: note.trim() || null });
  if (error) throw new Error(error.message);
}

export async function getJobApplications(jobId: string): Promise<JobApplicationWithTeacher[]> {
  const { data, error } = await supabase
    .from('job_applications')
    .select(`*, teacher:profiles!job_applications_teacher_id_fkey(name, avatar_url, bio, location_name)`)
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: Record<string, unknown>) => {
    const t = row.teacher as { name: string | null; avatar_url: string | null; bio: string | null; location_name: string | null } | null;
    return {
      id:         row.id as string,
      job_id:     row.job_id as string,
      teacher_id: row.teacher_id as string,
      note:       row.note as string | null,
      status:     row.status as ApplicationStatus,
      created_at: row.created_at as string,
      teacher_name:       t?.name ?? null,
      teacher_avatar_url: t?.avatar_url ?? null,
      teacher_bio:        t?.bio ?? null,
      teacher_location:   t?.location_name ?? null,
    };
  });
}

export async function setApplicationStatus(id: string, status: ApplicationStatus): Promise<void> {
  const { error } = await supabase.from('job_applications').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);
}

// ── Internal: flatten joined job row ──────────

function flattenJob(row: Record<string, unknown>, viewerId: string | null): JobWithMeta {
  const employer = row.employer as { name: string | null; company_name: string | null } | null;
  const category = row.category as { name: string | null } | null;
  const apps = (row.applications ?? []) as Array<{ id: string; teacher_id?: string; status?: ApplicationStatus }>;
  const mine = viewerId ? apps.find((a) => a.teacher_id === viewerId) : undefined;

  return {
    id:            row.id as string,
    employer_id:   row.employer_id as string,
    category_id:   row.category_id as string | null,
    title:         row.title as string,
    description:   row.description as string | null,
    job_type:      row.job_type as JobPostingType,
    pay_min:       row.pay_min as number | null,
    pay_max:       row.pay_max as number | null,
    location_name: row.location_name as string | null,
    status:        row.status as JobPosting['status'],
    created_at:    row.created_at as string,
    employer_name:    employer?.name ?? null,
    employer_company: employer?.company_name ?? null,
    category_name:    category?.name ?? null,
    application_count: apps.length,
    my_application_status: mine?.status ?? null,
  };
}
