import { ArrowRight } from 'lucide-react';
import SkillCarousel from './SkillCarousel';
import { skillCategories } from '../utils/mockData';

export default function PopularSkills() {
  return (
    <section className="py-12">
      <SkillCarousel
        skills={skillCategories}
        title="Popular Skills"
        subtitle="340+ skills taught by local experts"
        headerRight={
          <button className="flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">
            Browse all <ArrowRight size={14} />
          </button>
        }
      />
    </section>
  );
}
