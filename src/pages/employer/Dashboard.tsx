import { motion } from 'framer-motion';
import { ListChecks, Users, PlusSquare, TrendingUp, MapPin, Briefcase } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEmployerJobs } from '../../hooks/queries/useJobs';

function payLabel(min: number | null, max: number | null) {
  if (min && max) return `₹${min}–₹${max}`;
  if (min) return `From ₹${min}`;
  if (max) return `Up to ₹${max}`;
  return 'Negotiable';
}

export default function EmpDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { data: jobs = [], isLoading } = useEmployerJobs(profile?.id);

  const activeJobs = jobs.filter((j) => j.status === 'open').length;
  const totalApplications = jobs.reduce((sum, j) => sum + j.application_count, 0);

  const stats = [
    { label: 'Active Jobs',  value: String(activeJobs),        icon: ListChecks, color: '#F59E0B' },
    { label: 'Applications', value: String(totalApplications), icon: Users,      color: '#3B82F6' },
    { label: 'Total Posted', value: String(jobs.length),       icon: TrendingUp, color: '#22C55E' },
  ];

  const hasJobs = jobs.length > 0;

  return (
    <div className="min-h-screen px-6 py-14">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Welcome, {profile?.company_name ?? profile?.name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="text-gray-500">Find and hire verified skill professionals.</p>
        </motion.div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-5 card-shadow" style={{ border: '1px solid #F3F4F6' }}>
              <s.icon size={20} color={s.color} className="mb-2" />
              <p className="text-2xl font-bold text-gray-900">{isLoading ? '—' : s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {!hasJobs ? (
          <div className="bg-white rounded-2xl p-10 text-center card-shadow" style={{ border: '1px solid #F3F4F6' }}>
            <PlusSquare size={36} className="text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Post your first job
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Reach thousands of verified skill professionals. Post in under 2 minutes.
            </p>
            <button onClick={() => navigate('/employer/post')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
              <PlusSquare size={16} /> Post a Job
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Your Jobs</h2>
              <button onClick={() => navigate('/employer/post')}
                className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-xl"
                style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
                <PlusSquare size={13} /> Post a Job
              </button>
            </div>
            <div className="space-y-3">
              {jobs.slice(0, 4).map((job) => (
                <button key={job.id} onClick={() => navigate('/employer/jobs')}
                  className="w-full text-left bg-white rounded-2xl p-4 card-shadow flex items-center gap-4" style={{ border: '1px solid #F3F4F6' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#F0FDF4' }}>
                    <Briefcase size={18} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{job.title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      {payLabel(job.pay_min, job.pay_max)}
                      {job.location_name && <span className="flex items-center gap-0.5"><MapPin size={11} /> {job.location_name}</span>}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">{job.application_count}</p>
                    <p className="text-[10px] text-gray-400">applicants</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
