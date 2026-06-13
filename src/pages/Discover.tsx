import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, SlidersHorizontal, MapPin, ShieldCheck, X, Search, LocateFixed } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { useCategories, useNearbySkills } from '../hooks/queries/useCatalogue';
import SkillTeacherCard from '../components/SkillTeacherCard';
import TeacherMap from '../components/TeacherMap';

export default function Discover() {
  const geo = useGeolocation();
  const { data: categories = [] } = useCategories();
  const [params] = useSearchParams();

  const [categoryId, setCategoryId] = useState<string | null>(params.get('category'));
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(params.get('q') ?? '');

  const { data: skills = [], isLoading } = useNearbySkills({
    lat: geo.lat, lng: geo.lng, categoryId, verifiedOnly, maxPrice,
    search: search.trim() || null,
  });

  const locating = geo.status === 'locating';
  const activeFilters = (categoryId ? 1 : 0) + (verifiedOnly ? 1 : 0) + (maxPrice ? 1 : 0);

  return (
    <div className="min-h-screen py-10 md:py-14">
      <div className="px-5 sm:px-6 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-green-700 uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <Compass size={13} /> Discover
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Skills Near You
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-gray-500 flex items-center gap-1.5 text-sm">
              <MapPin size={14} className="text-green-600" />
              {locating ? 'Finding your location…'
                : geo.status === 'granted' ? <>Near <span className="font-semibold text-gray-700">{geo.name}</span></>
                : geo.status === 'denied' ? 'Location off · enable it to sort by distance'
                : 'Enable location to sort teachers by distance'}
            </p>
            <button
              onClick={geo.locate}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors"
              style={{ backgroundColor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>
              <LocateFixed size={12} className={locating ? 'animate-spin' : ''} /> Use my location
            </button>
          </div>
        </motion.div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 mb-5"
          style={{ border: '1px solid #E5E7EB' }}>
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search a skill, teacher or tag…"
            className="flex-1 text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400 min-w-0" />
          {search && <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600"><X size={15} /></button>}
        </div>

        {/* Map */}
        <div className="mb-6">
          <TeacherMap skills={skills} userLat={geo.lat} userLng={geo.lng} height={260} />
        </div>

        {/* Category chips + filters */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-gray-300 transition-colors flex-shrink-0">
            <SlidersHorizontal size={14} /> Filters
            {activeFilters > 0 && (
              <span className="ml-0.5 w-4 h-4 rounded-full bg-green-500 text-white text-[10px] flex items-center justify-center">{activeFilters}</span>
            )}
          </button>
          <button
            onClick={() => setCategoryId(null)}
            className="text-sm px-3.5 py-2 rounded-full font-medium flex-shrink-0 transition-all"
            style={!categoryId
              ? { background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: 'white' }
              : { backgroundColor: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' }}>
            All
          </button>
          {categories.map((c) => (
            <button key={c.id}
              onClick={() => setCategoryId(categoryId === c.id ? null : c.id)}
              className="text-sm px-3.5 py-2 rounded-full font-medium flex-shrink-0 transition-all"
              style={categoryId === c.id
                ? { backgroundColor: c.color, color: 'white' }
                : { backgroundColor: c.bg, color: c.color, border: `1px solid ${c.color}33` }}>
              {c.name}{typeof c.count === 'number' ? ` ${c.count}` : ''}
            </button>
          ))}
        </div>

        {/* Filter panel */}
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="bg-white rounded-2xl p-4 mb-6 card-shadow overflow-hidden" style={{ border: '1px solid #F3F4F6' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-900">Filters</span>
              <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <label className="flex items-center justify-between py-2 cursor-pointer">
              <span className="flex items-center gap-2 text-sm text-gray-700"><ShieldCheck size={15} className="text-green-600" /> Verified teachers only</span>
              <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="accent-green-600 w-4 h-4" />
            </label>
            <div className="py-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-700">Max price</span>
                <span className="text-sm font-semibold text-green-700">{maxPrice ? `₹${maxPrice}` : 'Any'}</span>
              </div>
              <input type="range" min={100} max={500} step={50} value={maxPrice ?? 500}
                onChange={(e) => setMaxPrice(Number(e.target.value) === 500 ? null : Number(e.target.value))}
                className="w-full accent-green-600" />
            </div>
          </motion.div>
        )}

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">
            {isLoading ? 'Loading…' : `${skills.length} ${skills.length === 1 ? 'teacher' : 'teachers'}`}
          </h2>
        </div>

        {!isLoading && skills.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center card-shadow" style={{ border: '1px solid #F3F4F6' }}>
            <Compass size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No teachers match these filters yet.</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {skills.map((s, i) => <SkillTeacherCard key={s.id} skill={s} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
