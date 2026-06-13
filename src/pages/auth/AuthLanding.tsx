import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ChevronRight } from 'lucide-react';
import { AUTH_THEMES } from './authConfig';
import type { UserRole } from '../../types';

const ORDER: UserRole[] = ['customer', 'professional', 'employer'];

export default function AuthLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center px-5 py-10" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 mb-10">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
          <Zap size={20} color="white" strokeWidth={2.5} />
        </div>
        <span className="text-xl font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
          SkillSeekho
        </span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2"
            style={{ fontFamily: 'Outfit, sans-serif' }}>
            How will you use SkillSeekho?
          </h1>
          <p className="text-sm text-gray-500">Pick your role to sign in or create an account.</p>
        </div>

        <div className="space-y-3">
          {ORDER.map((role, i) => {
            const t = AUTH_THEMES[role];
            const Icon = t.icon;
            return (
              <motion.button
                key={role}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(`/auth/${role}/login`)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white text-left transition-shadow hover:shadow-md"
                style={{ border: '1.5px solid #E5E7EB' }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}>
                  <Icon size={22} color="white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    I'm {/[AEIOU]/.test(t.label[0]) ? 'an' : 'a'} {t.label}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{t.tagline}</p>
                </div>
                <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
              </motion.button>
            );
          })}
        </div>

        <Link to="/" className="block text-center text-xs font-medium text-gray-400 hover:text-gray-600 mt-8 transition-colors">
          ← Back to home
        </Link>
      </motion.div>
    </div>
  );
}
