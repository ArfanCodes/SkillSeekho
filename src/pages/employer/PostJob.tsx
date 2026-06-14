import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusSquare, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCategories } from '../../hooks/queries/useCatalogue';
import { useCreateJob } from '../../hooks/queries/useJobs';
import type { JobPostingType } from '../../types';

const JOB_TYPES: JobPostingType[] = ['full-time', 'part-time', 'contract', 'freelance'];

export default function EmpPostJob() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: categories = [] } = useCategories();
  const { mutateAsync: createJob, isPending } = useCreateJob(profile?.id ?? '');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [jobType, setJobType] = useState<JobPostingType>('part-time');
  const [payMin, setPayMin] = useState('');
  const [payMax, setPayMax] = useState('');
  const [location, setLocation] = useState(profile?.location_name ?? '');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!title.trim()) return setError('Job title is required.');
    if (payMin && payMax && Number(payMin) > Number(payMax)) {
      return setError('Minimum pay cannot exceed maximum pay.');
    }
    try {
      await createJob({
        title: title.trim(),
        description: description.trim() || null,
        category_id: categoryId || null,
        job_type: jobType,
        pay_min: payMin ? Number(payMin) : null,
        pay_max: payMax ? Number(payMax) : null,
        location_name: location.trim() || null,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post the job.');
    }
  }

  if (done) {
    return (
      <div className="min-h-screen px-6 py-14">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-10 text-center card-shadow" style={{ border: '1px solid #F3F4F6' }}>
            <CheckCircle size={44} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Job posted!
            </h2>
            <p className="text-sm text-gray-500 mb-6">Teachers can now see it and apply.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/employer/jobs')}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
                View My Jobs
              </button>
              <button onClick={() => { setDone(false); setTitle(''); setDescription(''); setPayMin(''); setPayMax(''); }}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-600"
                style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                Post another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-14">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Post a Job</h1>
          <p className="text-gray-500">Reach verified skill professionals in your area.</p>
        </motion.div>

        <form onSubmit={submit} className="bg-white rounded-2xl p-6 card-shadow space-y-4" style={{ border: '1px solid #F3F4F6' }}>
          <Field label="Job title" required>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="ss-input"
              placeholder="e.g. Weekend Guitar Instructor" />
          </Field>

          <Field label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="ss-input resize-none"
              placeholder="What does the role involve? Who are you looking for?" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="ss-input">
                <option value="">Any</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Type">
              <select value={jobType} onChange={(e) => setJobType(e.target.value as JobPostingType)} className="ss-input capitalize">
                {JOB_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Pay min (₹)">
              <input type="number" min={0} value={payMin} onChange={(e) => setPayMin(e.target.value)} className="ss-input" placeholder="e.g. 500" />
            </Field>
            <Field label="Pay max (₹)">
              <input type="number" min={0} value={payMax} onChange={(e) => setPayMax(e.target.value)} className="ss-input" placeholder="e.g. 1500" />
            </Field>
          </div>

          <Field label="Location">
            <input value={location} onChange={(e) => setLocation(e.target.value)} className="ss-input"
              placeholder="Area / neighbourhood" />
          </Field>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button type="submit" disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <PlusSquare size={16} />}
            {isPending ? 'Posting…' : 'Post Job'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}
