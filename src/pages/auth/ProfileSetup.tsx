import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, MapPin, Globe, ArrowRight, Building2, Mic2 } from 'lucide-react';
import { completeOnboarding } from '../../lib/api/auth';
import { useAuth } from '../../hooks/useAuth';
import VoicePrefillBar from '../../components/VoicePrefillBar';
import type { ProfileIntent, ListingIntent } from '../../types';

const LANGUAGES = ['Hindi', 'English', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi', 'Urdu'];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const role = profile?.role;

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [locationName, setLocationName] = useState('');
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  // Professional
  const [availability, setAvailability] = useState('');
  // Employer
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [website, setWebsite] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleLang = (lang: string) => {
    setSelectedLangs((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim()) { setError('Name is required'); return; }
    if (selectedLangs.length === 0) { setError('Select at least one language'); return; }

    setError('');
    setLoading(true);
    try {
      await completeOnboarding(user.id, {
        name: name.trim(),
        bio: bio.trim() || null,
        location_name: locationName.trim() || null,
        languages: selectedLangs,
        ...(role === 'professional' && { availability }),
        ...(role === 'employer' && {
          company_name: companyName.trim(),
          company_type: companyType.trim(),
          website: website.trim() || null,
        }),
      });
      await refreshProfile();
      // App.tsx RequireOnboarding guard now sees onboarding_complete = true → lets through
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not save profile. Try again.');
    } finally {
      setLoading(false);
    }
  };

  function handleVoiceFilled(data: ProfileIntent | ListingIntent) {
    if (data.mode !== 'profile') return;
    if (data.name)          setName(data.name);
    if (data.bio)           setBio(data.bio);
    if (data.location_name) setLocationName(data.location_name);
    if (data.languages?.length) setSelectedLangs(data.languages.filter((l) => LANGUAGES.includes(l)));
    if (data.availability && role === 'professional') setAvailability(data.availability);
  }

  const roleLabel = role === 'professional' ? 'Teacher' : role === 'employer' ? 'Employer' : 'Learner';
  const RoleIcon = role === 'professional' ? Mic2 : role === 'employer' ? Building2 : User;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#F9FAFB' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Set up your{' '}
            <span className="gradient-text">{roleLabel}</span> profile
          </h1>
          <p className="text-gray-500 text-sm">You can update these anytime in Settings.</p>
        </div>

        {role !== 'employer' && (
          <VoicePrefillBar mode="profile" onFilled={handleVoiceFilled} />
        )}

        <div className="bg-white rounded-3xl p-8 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Role badge */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-2"
              style={{ backgroundColor: '#F9FAFB', border: '1px solid #F3F4F6' }}>
              <RoleIcon size={15} className="text-green-600" />
              <span className="text-xs font-medium text-gray-600 capitalize">{role} account</span>
            </div>

            {/* Name */}
            <Field label="Full Name" required>
              <div className="input-row">
                <User size={15} className="text-gray-400" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === 'employer' ? 'Your name (contact person)' : 'Your full name'}
                  className="input-field"
                />
              </div>
            </Field>

            {/* Employer-only: company fields */}
            {role === 'employer' && (
              <>
                <Field label="Company Name" required>
                  <div className="input-row">
                    <Building2 size={15} className="text-gray-400" />
                    <input value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Swiggy, Urban Company" className="input-field" />
                  </div>
                </Field>
                <Field label="Company Type">
                  <select value={companyType} onChange={(e) => setCompanyType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm text-gray-700 bg-gray-50 outline-none"
                    style={{ border: '1.5px solid #E5E7EB' }}>
                    <option value="">Select type</option>
                    <option>Startup</option>
                    <option>SME</option>
                    <option>Enterprise</option>
                    <option>NGO</option>
                    <option>EdTech</option>
                    <option>Other</option>
                  </select>
                </Field>
                <Field label="Website (optional)">
                  <div className="input-row">
                    <Globe size={15} className="text-gray-400" />
                    <input value={website} onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yourcompany.com" className="input-field" />
                  </div>
                </Field>
              </>
            )}

            {/* Bio — customers & professionals */}
            {role !== 'employer' && (
              <Field label={role === 'professional' ? 'About you (shown to learners)' : 'Short bio (optional)'}>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder={role === 'professional'
                    ? 'e.g. 5+ years teaching Hyderabadi cuisine. Certified yoga instructor...'
                    : 'Tell teachers a bit about yourself...'}
                  className="w-full px-4 py-3 rounded-xl text-sm text-gray-700 bg-gray-50 outline-none resize-none"
                  style={{ border: '1.5px solid #E5E7EB' }}
                />
              </Field>
            )}

            {/* Availability — professionals only */}
            {role === 'professional' && (
              <Field label="Availability">
                <select value={availability} onChange={(e) => setAvailability(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-gray-700 bg-gray-50 outline-none"
                  style={{ border: '1.5px solid #E5E7EB' }}>
                  <option value="">Select availability</option>
                  <option>Weekends</option>
                  <option>Weekdays</option>
                  <option>Mornings</option>
                  <option>Evenings</option>
                  <option>Daily</option>
                  <option>Flexible</option>
                </select>
              </Field>
            )}

            {/* Location */}
            <Field label="Your City / Neighbourhood">
              <div className="input-row">
                <MapPin size={15} className="text-gray-400" />
                <input
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Koramangala, Bangalore"
                  className="input-field"
                />
              </div>
            </Field>

            {/* Languages */}
            <Field label="Languages you speak" required>
              <div className="flex flex-wrap gap-2 mt-1">
                {LANGUAGES.map((lang) => {
                  const active = selectedLangs.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLang(lang)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                      style={{
                        backgroundColor: active ? '#F0FDF4' : '#F9FAFB',
                        color: active ? '#16A34A' : '#6B7280',
                        border: active ? '1.5px solid #22C55E' : '1px solid #E5E7EB',
                      }}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </Field>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50 mt-2"
              style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <> Complete Setup <ArrowRight size={16} /> </>
              }
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ── Small helpers ───────────────────────────────

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

// Inject tiny utility classes into the document so we don't need extra CSS files
const style = document.createElement('style');
style.textContent = `
  .input-row { display:flex; align-items:center; gap:8px; padding:12px 16px; border-radius:12px; background:#F9FAFB; border:1.5px solid #E5E7EB; }
  .input-field { flex:1; font-size:14px; color:#111827; background:transparent; outline:none; }
  .input-field::placeholder { color:#9CA3AF; }
`;
if (!document.getElementById('profile-setup-style')) {
  style.id = 'profile-setup-style';
  document.head.appendChild(style);
}
