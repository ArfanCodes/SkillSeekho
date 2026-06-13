import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Check, ArrowLeft } from 'lucide-react';
import type { AuthTheme } from './authConfig';

interface AuthShellProps {
  theme: AuthTheme;
  children: React.ReactNode;
}

/**
 * Two-pane auth layout.
 *  - Mobile (default): a single themed form column with a compact header.
 *  - md+ : adds a branded left panel with the tenant tagline + perks.
 */
export default function AuthShell({ theme, children }: AuthShellProps) {
  const Icon = theme.icon;

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F9FAFB' }}>
      {/* ── Branded panel (desktop only) ─────────────────── */}
      <div
        className="hidden md:flex md:w-[44%] lg:w-[40%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: `linear-gradient(150deg, ${theme.from}, ${theme.to})` }}
      >
        {/* decorative blobs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20"
          style={{ background: 'white' }} />
        <div className="absolute -bottom-24 -left-10 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'white' }} />

        <Link to="/" className="relative flex items-center gap-2.5 text-white">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur">
            <Zap size={18} color="white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-black" style={{ fontFamily: 'Outfit, sans-serif' }}>
            SkillSeekho
          </span>
        </Link>

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-white/90 px-3 py-1 rounded-full bg-white/15 backdrop-blur mb-5">
            <Icon size={13} /> {theme.eyebrow}
          </span>
          <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-4"
            style={{ fontFamily: 'Outfit, sans-serif' }}>
            {theme.tagline}
          </h2>
          <ul className="space-y-3 mt-8">
            {theme.perks.map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-white/95 text-sm font-medium">
                <span className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0">
                  <Check size={12} color="white" strokeWidth={3} />
                </span>
                {perk}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/70">
          Speak. Learn. Earn. — hyperlocal skills for India.
        </p>
      </div>

      {/* ── Form column ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col px-5 py-6 sm:px-8 md:px-12">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between md:justify-end mb-8">
          <Link to="/" className="flex items-center gap-2 md:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}>
              <Zap size={15} color="white" strokeWidth={2.5} />
            </div>
            <span className="font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              SkillSeekho
            </span>
          </Link>
          <Link to="/auth"
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft size={14} /> Switch role
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm mx-auto my-auto"
        >
          {/* Role chip */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
            style={{ backgroundColor: theme.soft, border: `1px solid ${theme.softBorder}` }}>
            <Icon size={14} color={theme.accent} />
            <span className="text-xs font-bold" style={{ color: theme.accent }}>
              {theme.label} account
            </span>
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
}
