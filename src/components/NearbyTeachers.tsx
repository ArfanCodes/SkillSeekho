import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TeacherCarousel from './TeacherCarousel';
import { useGeolocation } from '../hooks/useGeolocation';
import { useNearbySkills } from '../hooks/queries/useCatalogue';

export default function NearbyTeachers() {
  const navigate = useNavigate();
  const geo = useGeolocation();
  const { data: skills = [] } = useNearbySkills({ lat: geo.lat, lng: geo.lng, radiusKm: 25 });

  if (skills.length === 0) return null;

  return (
    <section className="py-10">
      <TeacherCarousel
        teachers={skills.slice(0, 6)}
        title="Nearby Teachers"
        subtitle={geo.status === 'granted' ? 'Sorted by distance from you' : `Around ${geo.name}`}
        headerRight={
          <button
            onClick={() => navigate('/discover')}
            className="flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">
            See all <ArrowRight size={14} />
          </button>
        }
      />
    </section>
  );
}
