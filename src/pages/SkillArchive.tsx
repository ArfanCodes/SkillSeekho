import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Archive, Search, Star, ShieldCheck, Calendar, Shield, Info, Loader2, Play,
  UserCheck, FileVideo, Key, Database, Users, Wallet, ArrowRight, X,
  TrendingUp, Award, FileText, ArrowDown, ExternalLink, Heart,
  MapPin, CheckCircle2, DollarSign, BookOpen, AlertCircle, Eye, ShieldAlert,
} from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { useCategories, useNearbySkills } from '../hooks/queries/useCatalogue';
import { useYoutubeVideos, getCategoryRegion, type YoutubeVideo } from '../hooks/queries/useYoutube';
import { mentors } from '../utils/mockData';
import { useNavigate } from 'react-router-dom';

const SKILL_CATEGORIES = [
  'Traditional Crafts',
  'Regional Cooking',
  'Folk Arts',
  'Handloom & Weaving',
  'Carpentry & Woodwork',
  'Pottery',
  'Metal Crafts',
  'Oral Traditions',
];

// ── Related local mentors helper ─────────────────────────────────────────────
function getRelatedMentors(category: string) {
  if (category === 'Regional Cooking') {
    return mentors.filter(m => m.category === 'Cooking');
  }
  if (category === 'Handloom & Weaving' || category === 'Traditional Crafts') {
    return mentors.filter(m => m.category === 'Tailoring');
  }
  if (category === 'Folk Arts') {
    return mentors.filter(m => m.category === 'Photography');
  }
  return mentors.slice(0, 2);
}

export default function SkillArchive() {
  const geo = useGeolocation();
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();
  const [search, setSearch] = useState('');
  const total = categories.reduce((sum, c) => sum + (c.count ?? 0), 0);

  const [selectedCategory, setSelectedCategory] = useState('Traditional Crafts');
  const [selectedVideo, setSelectedVideo] = useState<YoutubeVideo | null>(null);

  const { data: videos = [], isLoading, error, refetch } = useYoutubeVideos(selectedCategory);

  // Filter videos client-side if a search term is active
  const filteredVideos = videos.filter(video => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      video.snippet.title.toLowerCase().includes(q) ||
      video.snippet.channelTitle.toLowerCase().includes(q) ||
      video.snippet.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen py-14 bg-gray-50 text-gray-900">
      <div className="px-6 max-w-6xl mx-auto">
        
        {/* ── HERO SECTION (DO NOT MODIFY CONTENT) ────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black mb-3 text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Every skill, archived.
          </h1>
          <p className="text-gray-500 font-medium">Browse {total} {total === 1 ? 'skill' : 'skills'} taught by local experts.</p>
        </motion.div>
        {/* ───────────────────────────────────────────────────────────── */}

        {/* Search Bar */}
        <div className="flex gap-3 mb-8">
          <div className="flex-1 flex items-center bg-white rounded-2xl px-4 py-3.5 gap-3 shadow-xs border border-gray-200 transition-all focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10">
            <Search size={18} className="text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400 bg-transparent font-medium"
              placeholder="Search archived traditional videos or channels..."
            />
          </div>
        </div>

        {/* Category Chips Container */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3.5">
            Preservation Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {SKILL_CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/10 scale-102'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-500 hover:text-emerald-600'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 1. DYNAMIC SKILL ARCHIVE SHOWCASE ──────────────────────── */}
        <div className="mb-20">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Digital Heritage Archive
              </h2>
              <p className="text-sm text-gray-500 font-medium">
                Live traditional techniques fetched dynamically from verified preservation feeds
              </p>
            </div>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">
              Region: {getCategoryRegion(selectedCategory)}
            </span>
          </div>

          {/* Loading Skeletons */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs animate-pulse">
                  <div className="aspect-video bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded-md w-3/4" />
                    <div className="h-3 bg-gray-200 rounded-md w-1/2" />
                    <div className="h-8 bg-gray-200 rounded-lg w-full mt-4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-md mx-auto my-8">
              <ShieldAlert className="mx-auto text-red-500 mb-3" size={42} />
              <h3 className="font-bold text-red-800 text-base mb-1">Archive Connection Failed</h3>
              <p className="text-xs text-red-600 mb-4">
                Unable to retrieve live videos due to API limitations. Click below to retry or view mock archives.
              </p>
              <button
                onClick={() => refetch()}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Retry Connection
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredVideos.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center max-w-md mx-auto my-8 shadow-xs">
              <Search className="mx-auto text-gray-300 mb-3" size={40} />
              <h3 className="font-bold text-gray-700 text-base mb-1">No Archives Found</h3>
              <p className="text-xs text-gray-400">
                Try refining your search query or switching categories.
              </p>
            </div>
          )}

          {/* Videos Grid */}
          {!isLoading && !error && filteredVideos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video, idx) => (
                <motion.div
                  key={video.id.videoId || idx}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md hover:border-gray-300 transition-all flex flex-col group"
                >
                  <div className="aspect-video relative overflow-hidden bg-gray-100">
                    <img
                      src={video.snippet.thumbnails.high.url}
                      alt={video.snippet.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/95 text-emerald-600 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <Play size={20} fill="currentColor" className="ml-1" />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {selectedCategory}
                        </span>
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">
                          {getCategoryRegion(selectedCategory).split(' ')[0]}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-gray-800 line-clamp-2 mb-1.5 group-hover:text-emerald-700 transition-colors">
                        {video.snippet.title}
                      </h4>
                      <p className="text-xs text-gray-400 font-medium mb-4">
                        By {video.snippet.channelTitle} • {new Date(video.snippet.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedVideo(video)}
                      className="w-full py-2.5 rounded-xl bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 text-xs font-bold border border-gray-200 hover:border-emerald-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Archive size={13} />
                      View Archive
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* ── 2. DOCUMENTATION & PRESERVATION MECHANISM ──────────────── */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black mb-3 text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              The Preservation Model
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              How NearNative documents, protects, and compensates traditional knowledge holders ethically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
            {/* Steps Timeline Grid */}
            {[
              { icon: <UserCheck size={20} />, title: 'Practitioner Consent', desc: 'Verify identity, establish clear project intent, and secure complete audio-visual documentation consent.' },
              { icon: <FileVideo size={20} />, title: 'Knowledge Documentation', desc: 'High-definition video archiving of processes, raw material formulas, and regional cultural origins.' },
              { icon: <Key size={20} />, title: 'Ownership Assignment', desc: 'Create permanent cryptographically signed trust credentials ensuring ownership stays with the artisan.' },
              { icon: <Database size={20} />, title: 'Archive Storage', desc: 'Immutable storage of traditional skills metadata, open for local discovery but gated for commercial licensing.' },
              { icon: <Users size={20} />, title: 'Community Discovery', desc: 'Connect global enthusiasts and local learners directly to documented gurus for booking paid interactive classes.' },
              { icon: <Wallet size={20} />, title: 'Royalty Distribution', desc: 'Process automated royalty earnings from archive plays, educational licenses, and direct booking splits.' }
            ].map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ y: -6, borderColor: '#10B981' }}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                    {step.icon}
                  </div>
                  <h4 className="font-bold text-base text-gray-800 mb-2">{step.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">{step.desc}</p>
                </div>
                <div className="mt-4 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-gray-300 group-hover:text-emerald-500 transition-colors">
                    STEP 0{idx + 1}
                  </span>
                  <div className="h-px flex-1 bg-gray-100 group-hover:bg-emerald-100 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── 3. FAIR COMPENSATION & REVENUE SHARING ─────────────────── */}
        <div className="mb-24 bg-slate-900 text-white rounded-3xl p-8 md:p-12 overflow-hidden relative shadow-lg">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-1">
            <div className="space-y-6">
              <span className="text-xs font-bold tracking-widest text-emerald-400 bg-emerald-950/80 px-3.5 py-1.5 rounded-full uppercase border border-emerald-800/60">
                Fair Remuneration
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white!" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Compensation &amp; Lifetime Royalties
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Traditional knowledge is invaluable. Our three-tiered economic system guarantees practitioners are rewarded fairly for preserving their crafts.
              </p>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-1.5 bg-emerald-500 rounded-full flex-shrink-0 my-1" />
                  <div>
                    <h5 className="font-bold text-sm text-white!">Upfront Documentation Fee</h5>
                    <p className="text-xs text-slate-400 font-medium">Practitioners receive direct, immediate compensation for participating in recording sessions.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-1.5 bg-emerald-500 rounded-full flex-shrink-0 my-1" />
                  <div>
                    <h5 className="font-bold text-sm text-white!">Ownership &amp; Attribution Protection</h5>
                    <p className="text-xs text-slate-400 font-medium">All material belongs to the practitioner. NearNative serves strictly as the preservation facilitator.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-1.5 bg-emerald-500 rounded-full flex-shrink-0 my-1" />
                  <div>
                    <h5 className="font-bold text-sm text-white!">Lifetime Royalty Pool</h5>
                    <p className="text-xs text-slate-400 font-medium">80% of revenue from commercial licenses, archive views, and educational access is sent directly to the practitioner.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Flow Diagram */}
            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/60 p-6 md:p-8">
              <h4 className="font-bold text-white! text-sm text-slate-200 mb-6 flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-400" />
                Preservation Value Flow
              </h4>

              <div className="flex flex-col gap-6 relative">
                {/* Node 1 */}
                <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                      <Users size={16} />
                    </div>
                    <div>
                      <h6 className="text-xs font-bold text-white!">Viewers &amp; Licensees</h6>
                      <p className="text-[10px] text-slate-400 font-medium">Subscriptions &amp; Licensing</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">100% Inflow</span>
                </div>

                <div className="flex justify-center -my-2.5 z-2">
                  <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                    <ArrowDown size={12} className="text-slate-400" />
                  </div>
                </div>

                {/* Node 2 */}
                <div className="bg-slate-750 p-4 rounded-xl border border-slate-600/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <Archive size={16} />
                    </div>
                    <div>
                      <h6 className="text-xs font-bold text-white!">NearNative Archive Trust</h6>
                      <p className="text-[10px] text-slate-400 font-medium">Automated Smart Splitter</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">
                    Contract Verified
                  </span>
                </div>

                <div className="flex justify-center -my-2.5 z-2">
                  <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                    <ArrowDown size={12} className="text-emerald-400 animate-bounce" />
                  </div>
                </div>

                {/* Node 3 */}
                <div className="bg-emerald-950/60 p-4 rounded-xl border border-emerald-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                      <Wallet size={16} />
                    </div>
                    <div>
                      <h6 className="text-xs font-bold text-white!">Practitioner Royalty Wallet</h6>
                      <p className="text-[10px] text-emerald-500/70 font-medium">Direct Smart Payout</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">80% Split</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. OWNERSHIP & TRUST RECORDS ───────────────────────────── */}
        <div className="mb-24 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 space-y-4">
            <span className="text-xs font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase border border-emerald-100">
              Trust &amp; Attribution
            </span>
            <h3 className="text-2xl font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Verification Record
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              "Traditional knowledge should be preserved without exploiting the people who hold it. Every archive record includes consent, attribution, and transparent revenue-sharing."
            </p>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Verified Practitioner', desc: 'Identity matched with credentials, background audited, and skill verified.', icon: <CheckCircle2 size={16} /> },
              { title: 'Consent Obtained', desc: 'Clear legal consent documented for open-access and educational sharing.', icon: <ShieldCheck size={16} /> },
              { title: 'Ownership Protected', desc: 'All intellectual property registered under the practitioner\'s digital ID.', icon: <Shield size={16} /> },
              { title: 'Documentation Date', desc: 'Timestamped logs of recording sessions, location, and witness validation.', icon: <Calendar size={16} /> },
              { title: 'Revenue Sharing Active', desc: 'Connected to local bank account or wallet for automatic monthly splits.', icon: <DollarSign size={16} /> },
              { title: 'Licensing Enabled', desc: 'Non-exclusive educational licensing options validated and activated.', icon: <Key size={16} /> }
            ].map((record, idx) => (
              <div key={record.title} className="p-4 bg-gray-50 rounded-xl border border-gray-150 flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {record.icon}
                </div>
                <div>
                  <h5 className="font-bold text-xs text-gray-800 mb-1">{record.title}</h5>
                  <p className="text-[11px] text-gray-400 leading-normal font-medium">{record.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. IMPACT SECTION ──────────────────────────────────────── */}
        <div className="mb-14">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black mb-3 text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              The Impact
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Transforming preservation from passive observation into active, self-sustaining livelihood support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Preserve', highlight: 'Protect disappearing knowledge.', desc: 'Construct a permanent digital repository of delicate oral and manual masteries before they are lost to time.', bg: 'bg-emerald-50/50 border-emerald-100 text-emerald-800' },
              { title: 'Empower', highlight: 'Livelihood streams for masters.', desc: 'Generate long-term royalties and connect practitioners directly to modern digital consumers without intermediaries.', bg: 'bg-blue-50/50 border-blue-100 text-blue-800' },
              { title: 'Educate', highlight: 'Preserve authentic skill learning.', desc: 'Bridge geographical barriers, offering student access to genuine techniques straight from traditional custodians.', bg: 'bg-amber-50/50 border-amber-100 text-amber-800' }
            ].map((impact, idx) => (
              <motion.div
                key={impact.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`p-6 rounded-2xl border ${impact.bg} shadow-xs flex flex-col justify-between`}
              >
                <div>
                  <h4 className="text-lg font-black tracking-tight mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {impact.title}
                  </h4>
                  <p className="text-xs font-bold mb-3">{impact.highlight}</p>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">{impact.desc}</p>
                </div>
                <div className="mt-6">
                  <span className="text-[10px] font-bold bg-white px-2.5 py-1 rounded-full shadow-2xs border border-inherit">
                    Focus Area 0{idx + 1}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>

      {/* ── VIDEO DETAIL MODAL ─────────────────────────────────────── */}
      <AnimatePresence>
        {selectedVideo && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            {/* Backdrop */}
            <motion.div
              className="reviews-modal__backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVideo(null)}
            />

            {/* Modal Sheet */}
            <motion.div
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative z-2 shadow-2xl border border-gray-200"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Embed player */}
                <div className="aspect-video bg-black relative">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${selectedVideo.id.videoId}?autoplay=1`}
                    title={selectedVideo.snippet.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  {/* Meta */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md uppercase">
                        {selectedCategory}
                      </span>
                      <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md">
                        {getCategoryRegion(selectedCategory)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 leading-snug">
                      {selectedVideo.snippet.title}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium mt-1">
                      Published by <span className="font-bold text-emerald-600">{selectedVideo.snippet.channelTitle}</span> • {new Date(selectedVideo.snippet.publishedAt).toLocaleDateString('en-US', { dateStyle: 'long' })}
                    </p>
                  </div>

                  {/* Description */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150 text-xs text-gray-600 leading-relaxed font-medium space-y-2">
                    <h5 className="font-bold text-gray-700 uppercase tracking-wide text-[10px]">Video Description</h5>
                    <p className="whitespace-pre-wrap">{selectedVideo.snippet.description}</p>
                  </div>

                  {/* Related Local Tutors from NearNative */}
                  <div className="border-t border-gray-150 pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">Related NearNative Tutors</h4>
                        <p className="text-[11px] text-gray-400 font-medium">Verify experiences or book sessions with regional gurus locally</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getRelatedMentors(selectedCategory).map((tutor) => (
                        <div key={tutor.id} className="p-4 bg-white border border-gray-200 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow flex gap-3.5">
                          <img
                            src={tutor.photo}
                            alt={tutor.name}
                            className="w-14 h-14 rounded-xl object-cover bg-gray-50"
                          />
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <h5 className="font-bold text-xs text-gray-800 truncate">{tutor.name}</h5>
                                <div className="flex items-center text-[10px] font-bold text-amber-500">
                                  <Star size={10} fill="currentColor" className="mr-0.5" />
                                  {tutor.rating}
                                </div>
                              </div>
                              <p className="text-[10px] text-gray-400 truncate font-semibold">{tutor.skill}</p>
                              <p className="text-[10px] text-gray-400 font-medium mt-0.5 flex items-center gap-0.5">
                                <MapPin size={8} /> {tutor.location} ({tutor.distance})
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedVideo(null);
                                navigate('/discover');
                              }}
                              className="w-full mt-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Book Class (₹{tutor.pricePerSession}/session)
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
