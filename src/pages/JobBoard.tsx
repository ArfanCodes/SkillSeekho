import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, MapPin, Building2, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useOpenJobs, useApplyToJob } from '../hooks/queries/useJobs';
import type { JobWithMeta } from '../types';

function payLabel(min: number | null, max: number | null) {
  if (min && max) return `₹${min}–₹${max}`;
  if (min) return `From ₹${min}`;
  if (max) return `Up to ₹${max}`;
  return 'Pay negotiable';
}

export default function JobBoard() {
  const { profile } = useAuth();
  const { data: jobs = [], isLoading } = useOpenJobs(profile?.id);
  const [applyJob, setApplyJob] = useState<JobWithMeta | null>(null);

  return (
    <div className="min-h-screen px-6 py-14">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Find Jobs</h1>
          <p className="text-gray-500">Opportunities posted by employers near you.</p>
        </motion.div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" style={{ border: '1px solid #F3F4F6' }} />)}
          </div>
        )}

        {!isLoading && jobs.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center card-shadow" style={{ border: '1px solid #F3F4F6' }}>
            <Briefcase size={36} className="text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>No open jobs right now</h2>
            <p className="text-sm text-gray-500">Check back soon — new roles are posted regularly.</p>
          </div>
        )}

        <div className="space-y-4">
          {jobs.map((job, i) => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-5 card-shadow" style={{ border: '1px solid #F3F4F6' }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900">{job.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <Building2 size={12} /> {job.employer_company || job.employer_name || 'Employer'}
                  </p>
                </div>
                <span className="text-sm font-black text-gray-900 flex-shrink-0">{payLabel(job.pay_min, job.pay_max)}</span>
              </div>

              {job.description && <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-3">{job.description}</p>}

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs font-medium px-2.5 py-1 rounded-full capitalize" style={{ background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>
                  {job.job_type}
                </span>
                {job.category_name && <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' }}>{job.category_name}</span>}
                {job.location_name && <span className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={12} /> {job.location_name}</span>}
              </div>

              {job.my_application_status ? (
                <div className="flex items-center gap-1.5 text-sm font-semibold text-green-600">
                  <CheckCircle size={16} /> Applied{job.my_application_status === 'shortlisted' ? ' · Shortlisted' : job.my_application_status === 'rejected' ? ' · Not selected' : ''}
                </div>
              ) : (
                <button onClick={() => setApplyJob(job)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
                  Apply now
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {applyJob && profile && (
          <ApplyModal job={applyJob} teacherId={profile.id} onClose={() => setApplyJob(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ApplyModal({ job, teacherId, onClose }: { job: JobWithMeta; teacherId: string; onClose: () => void }) {
  const { mutateAsync: apply, isPending } = useApplyToJob();
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function submit() {
    setError('');
    try {
      await apply({ jobId: job.id, teacherId, note });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not apply.');
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6">
        {done ? (
          <div className="text-center py-4">
            <CheckCircle size={44} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Application sent!</h2>
            <p className="text-sm text-gray-500 mb-6">The employer can now review your profile.</p>
            <button onClick={onClose} className="w-full py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>Done</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-black" style={{ fontFamily: 'Outfit, sans-serif' }}>Apply</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <p className="text-xs text-gray-400 mb-5">{job.title} · {job.employer_company || job.employer_name}</p>

            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Message to employer (optional)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} className="ss-input resize-none mb-4"
              placeholder="Why you're a great fit for this role…" />

            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

            <button onClick={submit} disabled={isPending}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
              {isPending ? 'Sending…' : 'Submit application'}
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
