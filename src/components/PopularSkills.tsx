import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SkillCarousel from './SkillCarousel';
import { useCategories } from '../hooks/queries/useCatalogue';

export default function PopularSkills() {
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();
  const total = categories.reduce((sum, c) => sum + (c.count ?? 0), 0);

  return (
    <section className="py-12">
      <SkillCarousel
        skills={categories}
        title="Popular Skills"
        subtitle={`${total} ${total === 1 ? 'skill' : 'skills'} taught by local experts`}
        headerRight={
          <button
            onClick={() => navigate('/discover')}
            className="flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">
            Browse all <ArrowRight size={14} />
          </button>
        }
      />
    </section>
  );
}
