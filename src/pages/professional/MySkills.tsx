import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, Pencil, Trash2, X, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import {
  useCategories, useTeacherSkills, useCreateSkill, useUpdateSkill, useDeleteSkill,
} from '../../hooks/queries/useCatalogue';
import { uploadSkillCover, type SkillInput } from '../../lib/api/catalogue';
import LocationPicker from '../../components/LocationPicker';
import type { Skill } from '../../types';

const LANGUAGES = ['Hindi', 'English', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Bengali', 'Urdu'];
const AVAILABILITY = ['Weekends', 'Weekdays', 'Mornings', 'Evenings', 'Daily', 'Flexible'];

export default function ProSkills() {
  const { user } = useAuth();
  const teacherId = user?.id ?? '';
  const { data: skills = [], isLoading } = useTeacherSkills(teacherId);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [adding, setAdding] = useState(false);
  const del = useDeleteSkill(teacherId);

  const openAdd = () => { setEditing(null); setAdding(true); };
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
            <button onClick={openAdd} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
              <Plus size={16} /> Add Skill
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {skills.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl p-4 flex items-center gap-4 card-shadow" style={{ border: '1px solid #F3F4F6' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ backgroundColor: '#F0FDF4' }}>
                  {s.cover_image_url ? <img src={s.cover_image_url} alt="" className="w-full h-full object-cover" /> : <Star size={20} className="text-green-500" />}
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
          <SkillForm
            teacherId={teacherId}
            existing={editing}
            onClose={() => { setAdding(false); setEditing(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Add / Edit form (modal) ───────────────────

function SkillForm({ teacherId, existing, onClose }: { teacherId: string; existing: Skill | null; onClose: () => void }) {
  const { data: categories = [] } = useCategories();
  const create = useCreateSkill(teacherId);
  const update = useUpdateSkill(teacherId);

  const [title, setTitle] = useState(existing?.title ?? '');
  const [categoryId, setCategoryId] = useState(existing?.category_id ?? '');
  const [price, setPrice] = useState(existing?.price_per_session?.toString() ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [tags, setTags] = useState((existing?.tags ?? []).join(', '));
  const [langs, setLangs] = useState<string[]>(existing?.languages ?? []);
  const [availability, setAvailability] = useState(existing?.availability ?? '');
  const [lat, setLat] = useState<number | null>(existing?.location_lat ?? null);
  const [lng, setLng] = useState<number | null>(existing?.location_lng ?? null);
  const [locationName, setLocationName] = useState(existing?.location_name ?? '');
  const [coverUrl, setCoverUrl] = useState<string | null>(existing?.cover_image_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const toggleLang = (l: string) => setLangs((p) => p.includes(l) ? p.filter((x) => x !== l) : [...p, l]);
  const saving = create.isPending || update.isPending;

  const handleCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError('');
    try { setCoverUrl(await uploadSkillCover(teacherId, file)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Upload failed'); }
    finally { setUploading(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) return setError('Title is required');
    if (!price || Number(price) <= 0) return setError('Enter a valid price');

    const payload: SkillInput = {
      title: title.trim(),
      category_id: categoryId || null,
      price_per_session: Number(price),
      description: description.trim() || null,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      languages: langs,
      availability: availability || null,
      location_name: locationName.trim() || null,
      location_lat: lat,
      location_lng: lng,
      cover_image_url: coverUrl,
    };

    try {
      if (existing) await update.mutateAsync({ id: existing.id, updates: payload });
      else await create.mutateAsync(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}>
      <motion.div
        initial={{ y: '100%', opacity: 0.5 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0.5 }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <h2 className="text-lg font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {existing ? 'Edit Skill' : 'Add a Skill'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <Field label="Skill title" required>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Portrait Photography" className="ss-input" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="ss-input">
                <option value="">Select</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Price / session (₹)" required>
              <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="350" className="ss-input" />
            </Field>
          </div>

          <Field label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              placeholder="What will learners get from a session?" className="ss-input resize-none" />
          </Field>

          <Field label="Tags (comma separated)">
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="DSLR, Composition, Editing" className="ss-input" />
          </Field>

          <Field label="Availability">
            <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="ss-input">
              <option value="">Select</option>
              {AVAILABILITY.map((a) => <option key={a}>{a}</option>)}
            </select>
          </Field>

          <Field label="Languages">
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((l) => {
                const on = langs.includes(l);
                return (
                  <button key={l} type="button" onClick={() => toggleLang(l)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                    style={{ backgroundColor: on ? '#F0FDF4' : '#F9FAFB', color: on ? '#16A34A' : '#6B7280', border: on ? '1.5px solid #22C55E' : '1px solid #E5E7EB' }}>
                    {l}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Cover image">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden flex items-center justify-center flex-shrink-0" style={{ border: '1px solid #E5E7EB' }}>
                {coverUrl ? <img src={coverUrl} alt="" className="w-full h-full object-cover" /> : <Upload size={18} className="text-gray-300" />}
              </div>
              <label className="text-sm font-medium text-green-700 cursor-pointer flex items-center gap-1.5">
                {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading…</> : 'Upload image'}
                <input type="file" accept="image/*" onChange={handleCover} className="hidden" />
              </label>
            </div>
          </Field>

          <Field label="Teaching location">
            <LocationPicker lat={lat} lng={lng}
              onChange={(la, ln, name) => { setLat(la); setLng(ln); if (name) setLocationName(name); }} />
            <input value={locationName} onChange={(e) => setLocationName(e.target.value)}
              placeholder="Area / neighbourhood label" className="ss-input mt-2" />
          </Field>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button type="submit" disabled={saving || uploading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : existing ? 'Save changes' : 'Publish skill'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

// shared input styling
const style = document.createElement('style');
style.textContent = `.ss-input{width:100%;padding:11px 14px;border-radius:12px;background:#F9FAFB;border:1.5px solid #E5E7EB;font-size:14px;color:#111827;outline:none}
.ss-input::placeholder{color:#9CA3AF}.ss-input:focus{border-color:#22C55E}`;
if (typeof document !== 'undefined' && !document.getElementById('ss-input-style')) {
  style.id = 'ss-input-style';
  document.head.appendChild(style);
}
