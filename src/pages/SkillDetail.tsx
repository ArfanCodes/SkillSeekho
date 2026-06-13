import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Heart, MapPin, ShieldCheck, Calendar, Globe, Clock } from 'lucide-react';
import { useSkill, useSkillReviews } from '../hooks/queries/useCatalogue';
import TeacherMap from '../components/TeacherMap';

export default function SkillDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: skill, isLoading } = useSkill(id);
  const { data: reviews = [] } = useSkillReviews(id);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading…</div>;
  }
  if (!skill) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-gray-500">Skill not found.</p>
        <Link to="/discover" className="text-green-600 font-semibold text-sm">← Back to Discover</Link>
      </div>
    );
  }

  const symbol = skill.currency === 'INR' ? '₹' : skill.currency;
  const hasReviews = skill.review_count > 0;

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="px-5 sm:px-6 max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 mb-6">
          <ArrowLeft size={16} /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>{skill.title}</h1>
              <p className="text-gray-500 mt-1 flex items-center gap-1.5">
                {skill.teacher_name}
                {skill.teacher_verified && <span className="inline-flex items-center gap-1 text-xs text-green-700 font-semibold"><ShieldCheck size={13} /> Verified</span>}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-black text-gray-900">{symbol}{skill.price_per_session}</p>
              <p className="text-xs text-gray-400">per session</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm mb-5">
            <span className="flex items-center gap-1.5">
              <Star size={15} fill={hasReviews ? '#F59E0B' : '#D1D5DB'} color={hasReviews ? '#F59E0B' : '#D1D5DB'} />
              {hasReviews ? <><b>{skill.avg_rating}</b> <span className="text-gray-400">({skill.review_count})</span></> : <span className="text-gray-400">New</span>}
            </span>
            {skill.vouch_count > 0 && <span className="flex items-center gap-1.5"><Heart size={15} fill="#EF4444" color="#EF4444" /> <b>{skill.vouch_count}</b> <span className="text-gray-400">vouches</span></span>}
            {skill.distance_km != null && <span className="flex items-center gap-1.5 text-gray-500"><MapPin size={15} /> {skill.distance_km.toFixed(1)} km away</span>}
          </div>

          {skill.description && <p className="text-gray-600 leading-relaxed mb-5">{skill.description}</p>}

          <div className="flex flex-wrap gap-2 mb-5">
            {skill.tags.map((t) => (
              <span key={t} className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>{t}</span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
            {skill.availability && <div className="flex items-center gap-2 text-gray-600"><Clock size={15} className="text-gray-400" /> {skill.availability}</div>}
            {skill.languages.length > 0 && <div className="flex items-center gap-2 text-gray-600"><Globe size={15} className="text-gray-400" /> {skill.languages.join(', ')}</div>}
            {skill.location_name && <div className="flex items-center gap-2 text-gray-600 col-span-2"><MapPin size={15} className="text-gray-400" /> {skill.location_name}</div>}
          </div>

          {/* Location map */}
          {skill.location_lat != null && skill.location_lng != null && (
            <div className="mb-6">
              <TeacherMap skills={[skill]} userLat={skill.location_lat} userLng={skill.location_lng} height={220} />
            </div>
          )}

          <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white mb-8"
            style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
            <Calendar size={16} /> Book a Session
          </button>

          {/* Reviews */}
          <h2 className="text-lg font-bold text-gray-900 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Reviews {hasReviews && <span className="text-gray-400 font-medium">({skill.review_count})</span>}
          </h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-400">No reviews yet — be the first after your session.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="bg-white rounded-xl p-4 card-shadow" style={{ border: '1px solid #F3F4F6' }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-gray-800">{r.learner_name ?? 'Learner'}</span>
                    <span className="flex items-center gap-0.5 text-xs font-medium text-amber-600">
                      <Star size={12} fill="#F59E0B" color="#F59E0B" /> {r.rating}
                    </span>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
