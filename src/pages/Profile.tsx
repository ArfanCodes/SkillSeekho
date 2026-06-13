import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, LogOut, MapPin, Phone, Save, CheckCircle2, Camera, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { signOut, updateProfile } from '../lib/api/auth';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, profile, isAuthenticated, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [locationName, setLocationName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [avatarInput, setAvatarInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.name ?? '');
      setPhone(profile.phone ?? '');
      setLocationName(profile.location_name ?? '');
      setAvatarUrl(profile.avatar_url ?? '');
      setAvatarInput(profile.avatar_url ?? '');
    }
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleAvatarConfirm = () => {
    setAvatarUrl(avatarInput);
    setEditingAvatar(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await updateProfile(user.id, {
        name: username,
        phone: phone || null,
        location_name: locationName || null,
        avatar_url: avatarUrl || null,
      });
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-14 flex items-center justify-center" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl p-8 card-shadow border border-gray-100"
        >
          {/* ── Avatar ─────────────────────────────── */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-1">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={username || 'Profile'}
                  onError={() => setAvatarUrl('')}
                  className="w-24 h-24 rounded-full object-cover border-4 border-green-500 shadow"
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow"
                  style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
                >
                  {username ? username[0].toUpperCase() : <User size={30} />}
                </div>
              )}
              <button
                type="button"
                onClick={() => { setAvatarInput(avatarUrl); setEditingAvatar(true); }}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-transform hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
                title="Change profile photo"
              >
                <Camera size={14} color="white" strokeWidth={2.5} />
              </button>
            </div>

            {editingAvatar && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 w-full flex items-center gap-2"
              >
                <input
                  type="url"
                  value={avatarInput}
                  onChange={(e) => setAvatarInput(e.target.value)}
                  placeholder="Paste an image URL (https://...)"
                  autoFocus
                  className="flex-1 px-3 py-2 rounded-xl text-xs border border-gray-200 outline-none focus:border-green-500 transition-colors bg-gray-50"
                />
                <button
                  type="button"
                  onClick={handleAvatarConfirm}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => setEditingAvatar(false)}
                  className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}

            <p className="text-[11px] text-gray-400 mt-2">Tap the camera icon to change your photo</p>
            <h1 className="text-xl font-black text-gray-900 mt-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {username || 'Your Profile'}
            </h1>
            <span
              className="text-[11px] px-2.5 py-0.5 rounded-full font-bold text-white mt-1 capitalize"
              style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
            >
              {profile?.role ?? 'Learner'}
            </span>
          </div>

          {/* ── Editable fields ─────────────────────── */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Username</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-green-500 transition-colors bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-green-500 transition-colors bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Address</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Koramangala, Bangalore"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-green-500 transition-colors bg-gray-50"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading || !isAuthenticated}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : success ? (
                <><CheckCircle2 size={16} /> Saved!</>
              ) : (
                <><Save size={16} /> Save Changes</>
              )}
            </button>
          </form>

          {/* Sign Out — only for logged-in users */}
          {isAuthenticated && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-[10px] text-gray-300 uppercase tracking-widest">Account</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-500 font-semibold text-sm border border-red-100 bg-white hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
