import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, BadgeCheck, Building2, Users } from 'lucide-react';
import TeacherCarousel from '../components/TeacherCarousel';
import { mentors } from '../utils/mockData';

const jobs = [
  { id: 1, company: 'Swiggy', role: 'Regional Photography Trainer', skill: 'Photography', location: 'Bangalore', type: 'Part-time', pay: '₹800/hr', logo: 'SW', color: '#F97316', urgent: true },
  { id: 2, company: 'BYJU\'S', role: 'Spoken English Coach', skill: 'Language', location: 'Remote', type: 'Contract', pay: '₹600/hr', logo: 'BY', color: '#3B82F6', urgent: false },
  { id: 3, company: 'Zepto', role: 'Culinary Skills Instructor', skill: 'Cooking', location: 'Mumbai', type: 'Full-time', pay: '₹45,000/mo', logo: 'ZP', color: '#8B5CF6', urgent: true },
  { id: 4, company: 'Urban Company', role: 'Tailoring Mentor', skill: 'Tailoring', location: 'Delhi NCR', type: 'Freelance', pay: '₹500/hr', logo: 'UC', color: '#06B6D4', urgent: false },
  { id: 5, company: 'Cultfit', role: 'Yoga & Wellness Coach', skill: 'Wellness', location: 'Bangalore', type: 'Part-time', pay: '₹700/hr', logo: 'CF', color: '#22C55E', urgent: false },
];

export default function EmployerFeed() {
  return (
    <div className="min-h-screen py-14">
      <div className="px-6 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-green-700 uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <Briefcase size={13} /> Employer Feed
          </span>
          <h1 className="text-4xl font-black mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Hire verified skill teachers
          </h1>
          <p className="text-gray-500">Top companies hiring NearNative-verified skill experts.</p>
        </motion.div>

        <div className="space-y-4 mb-14">
          {jobs.map((job, i) => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              whileHover={{ y: -2 }}
              className="bg-white rounded-2xl p-5 card-shadow flex gap-4"
              style={{ border: '1px solid #F3F4F6' }}>
              {/* Logo */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: job.color }}>
                {job.logo}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-sm">{job.role}</p>
                      {job.urgent && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ backgroundColor: '#FEF2F2', color: '#EF4444' }}>Urgent</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Building2 size={12} className="text-gray-400" />
                      <p className="text-xs text-gray-500">{job.company}</p>
                    </div>
                  </div>
                  <p className="font-bold text-green-700 text-sm whitespace-nowrap">{job.pay}</p>
                </div>
                <div className="flex flex-wrap gap-3 mt-2">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin size={11} /> {job.location}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={11} /> {job.type}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <BadgeCheck size={11} className="text-green-500" /> {job.skill}
                  </div>
                </div>
              </div>
              <button className="self-center text-xs font-semibold px-4 py-2 rounded-xl text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
                Apply
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommended Teachers Carousel */}
      <TeacherCarousel
        teachers={mentors}
        title="Recommended Teachers"
        subtitle="Top-rated teachers matching employer requirements"
        headerRight={
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Users size={14} className="text-green-500" />
            <span>{mentors.length} available</span>
          </div>
        }
      />
    </div>
  );
}
