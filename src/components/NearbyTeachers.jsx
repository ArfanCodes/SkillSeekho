import { ArrowRight, Filter, MapPin } from 'lucide-react';
import TeacherCarousel from './TeacherCarousel';
import { mentors } from '../utils/mockData';

export default function NearbyTeachers() {
  return (
    <section className="py-10">
      <TeacherCarousel
        teachers={mentors}
        title="Nearby Teachers"
        subtitle="Within 3 km of Koramangala, Bangalore"
        headerRight={
          <button className="flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">
            See all <ArrowRight size={14} />
          </button>
        }
      />
    </section>
  );
}
