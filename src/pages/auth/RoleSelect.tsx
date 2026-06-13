import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Mic2, Briefcase, ArrowRight, CheckCircle } from 'lucide-react';
import { setRole } from '../../lib/api/auth';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types';

interface RoleOption {
  role: UserRole;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  perks: string[];
  color: string;
  bg: string;
  border: string;
}

const roles: RoleOption[] = [
  {
    role: 'customer',
    icon: GraduationCap,
    title: 'I want to learn',
    subtitle: 'Find local teachers and book skill sessions near you',
    perks: ['Browse 340+ skills', 'Book sessions nearby', 'Voice search in Hindi & more'],
    color: '#3B82F6',
    bg: '#EFF6FF',
    border: '#BFDBFE',
  },
  {
    role: 'professional',
    icon: Mic2,
    title: 'I want to teach',
    subtitle: 'Share your skill and earn in your neighbourhood',
    perks: ['Set your own price', 'Manage your schedule', 'Get community vouches'],
    color: '#22C55E',
    bg: '#F0FDF4',
    border: '#BBF7D0',
  },
  {
    role: 'employer',
    icon: Briefcase,
    title: 'I want to hire',
    subtitle: 'Find verified skill professionals for your business',
    perks: ['Browse verified teachers', 'Post jobs in minutes', 'Direct messaging'],
    color: '#F59E0B',
    bg: '#FFFBEB',
    border: '#FDE68A',
  },
];

export default function RoleSelect() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (!selected || !user) return;
    setError('');
    setLoading(true);
    try {
      await setRole(user.id, selected);
      await refreshProfile();
      navigate('/auth/setup');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#F9FAFB' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-green-700 uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            Step 1 of 2
          </span>
          <h1 className="text-4xl font-black text-gray-900 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            How will you use{' '}
            <span className="gradient-text">SkillSeekho?</span>
          </h1>
          <p className="text-gray-500">Choose your role — you can always create a second account later.</p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {roles.map((opt, i) => {
            const isSelected = selected === opt.role;
            return (
              <motion.button
                key={opt.role}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(opt.role)}
                className="relative text-left rounded-2xl p-6 transition-all"
                style={{
                  backgroundColor: isSelected ? opt.bg : '#FFFFFF',
                  border: isSelected ? `2px solid ${opt.color}` : '1.5px solid #E5E7EB',
                  boxShadow: isSelected
                    ? `0 8px 32px ${opt.color}20`
                    : '0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                {/* Selected checkmark */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4"
                  >
                    <CheckCircle size={20} color={opt.color} fill={opt.color} strokeWidth={0} />
                  </motion.div>
                )}

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: opt.bg, border: `1px solid ${opt.border}` }}>
                  <opt.icon size={22} color={opt.color} />
                </div>

                <h3 className="font-black text-gray-900 text-lg mb-1"
                  style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {opt.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">{opt.subtitle}</p>

                {/* Perks */}
                <ul className="space-y-1.5">
                  {opt.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-xs font-medium text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: opt.color }} />
                      {perk}
                    </li>
                  ))}
                </ul>
              </motion.button>
            );
          })}
        </div>

        {error && (
          <p className="text-center text-sm text-red-500 mb-4">{error}</p>
        )}

        <div className="flex justify-center">
          <motion.button
            onClick={handleContinue}
            disabled={!selected || loading}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
          >
            {loading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <> Continue <ArrowRight size={16} /> </>
            }
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
