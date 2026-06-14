import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListChecks, Users, ChevronDown, MapPin, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useEmployerJobs, useUpdateJob, useJobApplications, useSetApplicationStatus } from '../../hooks/queries/useJobs';
import { getOrCreateConversation } from '../../lib/api/messages';
import type { JobWithMeta, ApplicationStatus } from '../../types';

function payLabel(min: number | null, max: number | null) {
  if (min && max) return `₹${min}–₹${max}`;
  if (min) return `From ₹${min}`;
  if (max) return `Up to ₹${max}`;
  return 'Pay negotiable';
}

const APP_BADGE: Record<ApplicationStatus, { label: string; bg: string; color: string }> = {
  applied:     { label: 'New',         bg: '#DBEAFE', color: '#1E40AF' },
  shortlisted: { label: 'Shortlisted', bg: '#DCFCE7', color: '#166534' },
  rejected:    { label: 'Rejected',    bg: '#FEE2E2', color: '#991B1B' },
};

export default function EmpJobs() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: jobs = [], isLoading } = useEmployerJobs(profile?.id);
  const { mutate: updateJob } = useUpdateJob();
  const [openJobId, setOpenJobId] = useState<string | null>(null);

  if (!isLoading && jobs.length === 0) {
    return (
      <div className="min-h-screen px-6 py-14">
        <div className="max-w-3xl mx-auto">
          <Header />
          <div className="bg-white rounded-2xl p-10 text-center card-shadow" style={{ border: '1px solid #F3F4F6' }}>
            <ListChecks size={36} className="text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>No jobs posted yet</h2>
            <p className="text-sm text-gray-500 mb-6">Post your first job to start receiving applications.</p>
            <button onClick={() => navigate('/employer/post')}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
              Post a Job
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-14">
      <div className="max-w-3xl mx-auto">
        <Header />
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="bg-white rounded-2xl h-28 animate-pulse" style={{ border: '1px solid #F3F4F6' }} />)}
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobRow
                key={job.id}
                job={job}
                expanded={openJobId === job.id}
                onToggle={() => setOpenJobId(openJobId === job.id ? null : job.id)}
                onClose={() => updateJob({ id: job.id, updates: { status: job.status === 'open' ? 'closed' : 'open' } })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Header() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>My Jobs</h1>
      <p className="text-gray-500">Job postings you've created and their applicants.</p>
    </motion.div>
  );
}

function JobRow({ job, expanded, onToggle, onClose }: {
  job: JobWithMeta; expanded: boolean; onToggle: () => void; onClose: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl card-shadow overflow-hidden" style={{ border: '1px solid #F3F4F6' }}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 truncate">{job.title}</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={job.status === 'open'
                  ? { background: '#DCFCE7', color: '#166534' }
                  : { background: '#F3F4F6', color: '#6B7280' }}>
                {job.status === 'open' ? 'Open' : 'Closed'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center gap-1 capitalize"><Briefcase size={12} /> {job.job_type}</span>
              <span>{payLabel(job.pay_min, job.pay_max)}</span>
              {job.location_name && <span className="flex items-center gap-1"><MapPin size={12} /> {job.location_name}</span>}
            </p>
          </div>
          <button onClick={onClose}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0"
            style={{ background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' }}>
            {job.status === 'open' ? 'Close' : 'Reopen'}
          </button>
        </div>

        <button onClick={onToggle}
          className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-green-600">
          <Users size={15} /> {job.application_count} applicant{job.application_count === 1 ? '' : 's'}
          <ChevronDown size={15} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 overflow-hidden">
            <Applicants jobId={job.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Applicants({ jobId }: { jobId: string }) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: apps = [], isLoading } = useJobApplications(jobId);
  const { mutate: setStatus } = useSetApplicationStatus();

  async function message(teacherId: string) {
    if (!profile) return;
    const convId = await getOrCreateConversation(profile.id, teacherId);
    navigate(`/messages/${convId}`);
  }

  if (isLoading) return <div className="p-5 text-sm text-gray-400">Loading applicants…</div>;
  if (apps.length === 0) return <div className="p-5 text-sm text-gray-400">No applications yet.</div>;

  return (
    <div className="p-4 space-y-3 bg-gray-50">
      {apps.map((a) => {
        const badge = APP_BADGE[a.status];
        return (
          <div key={a.id} className="bg-white rounded-xl p-3.5" style={{ border: '1px solid #F3F4F6' }}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
                {(a.teacher_name ?? '?').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm text-gray-900 truncate">{a.teacher_name ?? 'Teacher'}</p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
                </div>
                {a.teacher_location && <p className="text-xs text-gray-400">{a.teacher_location}</p>}
                {a.note && <p className="text-xs text-gray-600 mt-1.5 italic">"{a.note}"</p>}

                <div className="flex gap-2 mt-2.5">
                  {a.status !== 'shortlisted' && (
                    <button onClick={() => setStatus({ id: a.id, status: 'shortlisted' })}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: '#DCFCE7', color: '#166534' }}>
                      Shortlist
                    </button>
                  )}
                  {a.status !== 'rejected' && (
                    <button onClick={() => setStatus({ id: a.id, status: 'rejected' })}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: '#FEE2E2', color: '#991B1B' }}>
                      Reject
                    </button>
                  )}
                  <button onClick={() => message(a.teacher_id)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>
                    Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
