import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import TeacherCarousel from '../../components/TeacherCarousel';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useNearbySkills } from '../../hooks/queries/useCatalogue';

export default function EmpTeachers() {
  const geo = useGeolocation();
  // Employers hire verified professionals → show verified listings first.
  const { data: verified = [] } = useNearbySkills({ lat: geo.lat, lng: geo.lng, verifiedOnly: true });
  const { data: all = [] } = useNearbySkills({ lat: geo.lat, lng: geo.lng });

  return (
    <div className="min-h-screen py-14">
      <div className="px-6 max-w-5xl mx-auto mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-green-700 uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <Users size={13} /> Browse Teachers
          </span>
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Hire verified professionals</h1>
          <p className="text-gray-500">Browse skill experts you can hire directly.</p>
        </motion.div>
      </div>

      {verified.length > 0 && (
        <TeacherCarousel teachers={verified} title="Verified Teachers" subtitle="Identity-verified professionals" />
      )}
      <TeacherCarousel teachers={all} title="All Teachers" subtitle="Every local expert near you" />
    </div>
  );
}
