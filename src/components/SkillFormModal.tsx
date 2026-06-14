import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useCategories, useCreateSkill, useUpdateSkill } from '../hooks/queries/useCatalogue';
import { type SkillInput } from '../lib/api/catalogue';
import VoicePrefillBar from './VoicePrefillBar';
import type { Skill, ProfileIntent, ListingIntent } from '../types';

const LANGUAGES   = ['Hindi', 'English', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Bengali', 'Urdu'];
const AVAILABILITY = ['Weekends', 'Weekdays', 'Mornings', 'Evenings', 'Daily', 'Flexible'];

interface Props {
  teacherId: string;
  existing?: Skill | null;
  onClose: () => void;
}

export default function SkillFormModal({ teacherId, existing, onClose }: Props) {
  const { data: categories = [] } = useCategories();
  const create = useCreateSkill(teacherId);
  const update = useUpdateSkill(teacherId);

  const [title,        setTitle]        = useState(existing?.title ?? '');
  const [categoryId,   setCategoryId]   = useState(existing?.category_id ?? '');
  const [price,        setPrice]        = useState(existing?.price_per_session?.toString() ?? '');
  const [description,  setDescription]  = useState(existing?.description ?? '');
  const [tags,         setTags]         = useState((existing?.tags ?? []).join(', '));
  const [langs,        setLangs]        = useState<string[]>(existing?.languages ?? []);
  const [availability, setAvailability] = useState(existing?.availability ?? '');
  const [error,        setError]        = useState('');

  const toggleLang = (l: string) => setLangs((p) => p.includes(l) ? p.filter((x) => x !== l) : [...p, l]);
  const saving = create.isPending || update.isPending;

  // Clear stale validation errors when user corrects the field
  useEffect(() => { if (error) setError(''); }, [title, price]);

  function handleVoiceFilled(data: ProfileIntent | ListingIntent) {
    if (data.mode !== 'listing') return;
    if (data.title)             setTitle(data.title);
    if (data.price_per_session) setPrice(String(data.price_per_session));
    if (data.description)       setDescription(data.description ?? '');
    if (data.tags?.length)      setTags(data.tags.join(', '));
    if (data.availability)      setAvailability(data.availability ?? '');
    // Always default to Hindi + Malayalam; user can deselect if not needed
    setLangs(['Hindi', 'Malayalam']);
    if (data.category_slug) {
      const cat = categories.find((c) => c.slug === data.category_slug);
      if (cat) setCategoryId(cat.id);
    }
  }

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
      // Location & cover were removed from the form; preserve any existing
      // values on edit, leave null for new skills.
      location_name: existing?.location_name ?? null,
      location_lat: existing?.location_lat ?? null,
      location_lng: existing?.location_lng ?? null,
      cover_image_url: existing?.cover_image_url ?? null,
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
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}>
      <motion.div
        initial={{ y: '100%', opacity: 0.5 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0.5 }}
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
          {!existing && <VoicePrefillBar mode="listing" onFilled={handleVoiceFilled} />}

          <Field label="Skill title" required>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Portrait Photography" className="ss-input" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="ss-input">
                <option value="">Select</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Price / session (₹)" required>
              <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)}
                placeholder="350" className="ss-input" />
            </Field>
          </div>

          <Field label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              placeholder="What will learners get from a session?" className="ss-input resize-none" />
          </Field>

          <Field label="Tags (comma separated)">
            <input value={tags} onChange={(e) => setTags(e.target.value)}
              placeholder="DSLR, Composition, Editing" className="ss-input" />
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

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button type="submit" disabled={saving}
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

const style = document.createElement('style');
style.textContent = `.ss-input{width:100%;padding:11px 14px;border-radius:12px;background:#F9FAFB;border:1.5px solid #E5E7EB;font-size:14px;color:#111827;outline:none}
.ss-input::placeholder{color:#9CA3AF}.ss-input:focus{border-color:#22C55E}`;
if (typeof document !== 'undefined' && !document.getElementById('ss-input-style')) {
  style.id = 'ss-input-style';
  document.head.appendChild(style);
}
