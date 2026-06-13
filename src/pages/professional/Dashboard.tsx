import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CalendarCheck, Star, Wallet, Users, Plus, Pencil, Trash2, ArrowRight, Mic,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTeacherSkills, useDeleteSkill } from '../../hooks/queries/useCatalogue';
import SkillFormModal from '../../components/SkillFormModal';
import type { Skill } from '../../types';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function today() {
  return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ProDashboard() {
  const { user, profile } = useAuth();
  const teacherId = user?.id ?? '';
  const { data: skills = [], isLoading: skillsLoading } = useTeacherSkills(teacherId);
  const del = useDeleteSkill(teacherId);

  const [editing, setEditing] = useState<Skill | null>(null);
  const [adding,  setAdding]  = useState(false);

  const openAdd  = () => { setEditing(null); setAdding(true); };
  const openEdit = (s: Skill) => { setEditing(s); setAdding(true); };

  const firstName = profile?.name?.split(' ')[0] ?? 'Teacher';
  const hasSkills = skills.length > 0;

  return (
    <div className="min-h-screen px-5 sm:px-6 py-10 max-w-3xl mx-auto">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{today()}</p>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {greeting()}, {firstName}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {hasSkills ? `You have ${skills.length} skill${skills.length > 1 ? 's' : ''} listed.` : 'Set up your profile to start getting bookings.'}
        </p>
      </motion.div>

      {/* ── Stats strip ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-4 gap-3 mb-8">
        {[
          { icon: CalendarCheck, label: 'Bookings', value: '0',  color: '#3B82F6', bg: '#EFF6FF' },
          { icon: Wallet,        label: 'Earned',   value: '₹0', color: '#22C55E', bg: '#F0FDF4' },
          { icon: Star,          label: 'Rating',   value: '—',  color: '#F59E0B', bg: '#FFFBEB' },
          { icon: Users,         label: 'Vouches',  value: '0',  color: '#EC4899', bg: '#FDF2F8' },
        ].map(({ icon: Icon, label, value, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 + i * 0.05 }}
            className="bg-white rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-1 card-shadow"
            style={{ border: '1px solid #F3F4F6' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
              <Icon size={15} color={color} />
            </div>
            <p className="text-lg font-bold text-gray-900 leading-none">{value}</p>
            <p className="text-[10px] text-gray-400 text-center leading-tight">{label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Upcoming Bookings ── */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Upcoming Bookings
          </h2>
          <Link to="/pro/bookings"
            className="text-xs font-semibold text-green-600 flex items-center gap-1 hover:underline">
            See all <ArrowRight size={12} />
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-8 text-center card-shadow" style={{ border: '1px solid #F3F4F6' }}>
          <CalendarCheck size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-500 text-sm">No upcoming bookings</p>
          <p className="text-xs text-gray-400 mt-1">
            {hasSkills ? 'Share your profile link to get your first booking.' : 'Add a skill below to start receiving requests.'}
          </p>
        </div>
      </motion.section>

      {/* ── My Skills (combined with onboarding for new teachers) ── */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            My Skills
          </h2>
          {hasSkills && (
            <button onClick={openAdd}
              className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-xl"
              style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
              <Plus size={13} /> Add Skill
            </button>
          )}
        </div>

        {skillsLoading ? (
          <div className="h-24 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !hasSkills ? (
          /* ── First-time onboarding card ── */
          <div className="bg-white rounded-2xl p-6 card-shadow" style={{ border: '1px solid #F3F4F6' }}>
            <p className="text-sm font-semibold text-gray-700 mb-1">List your first skill</p>
            <p className="text-xs text-gray-400 mb-5">Speak your skill intro or fill the form — takes under a minute.</p>

            {/* Voice shortcut */}
            <button onClick={openAdd}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl mb-3 text-left"
              style={{ backgroundColor: '#F0FDF4', border: '1.5px solid #BBF7D0' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
                <Mic size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-800">Add with voice</p>
                <p className="text-xs text-green-600">Say your skill, price and what you teach</p>
              </div>
              <ArrowRight size={16} className="text-green-500 ml-auto flex-shrink-0" />
            </button>

            <button onClick={openAdd}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100"
              style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <Plus size={15} /> Fill manually instead
            </button>
          </div>
        ) : (
          /* ── Skill cards ── */
          <div className="space-y-3">
            {skills.map((s, i) => (
              <motion.div key={s.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-4 flex items-center gap-4 card-shadow"
                style={{ border: '1px solid #F3F4F6' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{ backgroundColor: '#F0FDF4' }}>
                  {s.cover_image_url
                    ? <img src={s.cover_image_url} alt="" className="w-full h-full object-cover" />
                    : <Star size={20} className="text-green-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{s.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    ₹{s.price_per_session}/session
                    {s.location_name ? ` · ${s.location_name}` : ''}
                    {!s.active ? ' · hidden' : ''}
                  </p>
                </div>
                <button onClick={() => openEdit(s)} className="p-2 text-gray-400 hover:text-gray-700 transition-colors">
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => { if (confirm(`Delete "${s.title}"?`)) del.mutate(s.id); }}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      <div className="h-12" />

      <AnimatePresence>
        {adding && (
          <SkillFormModal
            teacherId={teacherId}
            existing={editing}
            onClose={() => { setAdding(false); setEditing(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
