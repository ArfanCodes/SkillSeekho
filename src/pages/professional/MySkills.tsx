import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTeacherSkills, useDeleteSkill } from '../../hooks/queries/useCatalogue';
import SkillFormModal from '../../components/SkillFormModal';
import type { Skill } from '../../types';

export default function ProSkills() {
  const { user } = useAuth();
  const teacherId = user?.id ?? '';
  const { data: skills = [], isLoading } = useTeacherSkills(teacherId);
  const [editing, setEditing]   = useState<Skill | null>(null);
  const [adding,  setAdding]    = useState(false);
  const del = useDeleteSkill(teacherId);

  const openAdd  = () => { setEditing(null); setAdding(true); };
  const openEdit = (s: Skill) => { setEditing(s); setAdding(true); };

  return (
    <div className="min-h-screen px-5 sm:px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>My Skills</h1>
            <p className="text-gray-500">Manage the skills you teach and your rates.</p>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
            <Plus size={16} /> Add Skill
          </button>
        </motion.div>

        {isLoading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : skills.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center card-shadow" style={{ border: '1px solid #F3F4F6' }}>
            <Star size={36} className="text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>No skills listed yet</h2>
            <p className="text-sm text-gray-500 mb-6">Add a skill to start receiving booking requests.</p>
            <button onClick={openAdd}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
              <Plus size={16} /> Add Skill
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {skills.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl p-4 flex items-center gap-4 card-shadow"
                style={{ border: '1px solid #F3F4F6' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{ backgroundColor: '#F0FDF4' }}>
                  {s.cover_image_url
                    ? <img src={s.cover_image_url} alt="" className="w-full h-full object-cover" />
                    : <Star size={20} className="text-green-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{s.title}</p>
                  <p className="text-xs text-gray-500">₹{s.price_per_session} / session · {s.location_name ?? 'No location'}{!s.active && ' · hidden'}</p>
                </div>
                <button onClick={() => openEdit(s)} className="p-2 text-gray-400 hover:text-gray-700 transition-colors"><Pencil size={16} /></button>
                <button onClick={() => { if (confirm(`Delete "${s.title}"?`)) del.mutate(s.id); }}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

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
