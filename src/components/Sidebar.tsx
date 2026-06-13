import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Compass, Mic, Heart, Archive, CreditCard,
  MessageSquare, User, Zap, ChevronRight, X,
  LayoutDashboard, Star, CalendarCheck, Wallet,
  PlusSquare, Users, ListChecks, LogIn,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { signOut } from '../lib/api/auth';
import { useNavigate } from 'react-router-dom';
import type { UserRole } from '../types';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

// Guest sees only public routes
const guestNav: NavItem[] = [
  { path: '/',         label: 'Home',             icon: Home    },
  { path: '/discover', label: 'Discover Skills',  icon: Compass },
  { path: '/voice',    label: 'Voice Search',     icon: Mic     },
  { path: '/archive',  label: 'Skill Archive',    icon: Archive },
  { path: '/profile',  label: 'Profile',          icon: User    },
];

const customerNav: NavItem[] = [
  { path: '/',         label: 'Home',             icon: Home          },
  { path: '/discover', label: 'Discover Skills',  icon: Compass       },
  { path: '/voice',    label: 'Voice Search',     icon: Mic           },
  { path: '/archive',  label: 'Skill Archive',    icon: Archive       },
  { path: '/profile',  label: 'Profile',          icon: User          },
  { path: '/payments', label: 'Payments',         icon: CreditCard    },
  { path: '/messages', label: 'Messages',         icon: MessageSquare },
];

const professionalNav: NavItem[] = [
  { path: '/pro',          label: 'Dashboard',       icon: LayoutDashboard },
  { path: '/pro/skills',   label: 'My Skills',       icon: Star            },
  { path: '/pro/bookings', label: 'Manage Bookings', icon: CalendarCheck   },
  { path: '/pro/earnings', label: 'Earnings',        icon: Wallet          },
  { path: '/messages',     label: 'Messages',        icon: MessageSquare   },
  { path: '/profile',      label: 'Profile',         icon: User            },
];

const employerNav: NavItem[] = [
  { path: '/employer',          label: 'Dashboard',        icon: LayoutDashboard },
  { path: '/employer/post',     label: 'Post a Job',       icon: PlusSquare      },
  { path: '/employer/teachers', label: 'Browse Teachers',  icon: Users           },
  { path: '/employer/jobs',     label: 'My Jobs',          icon: ListChecks      },
  { path: '/messages',          label: 'Messages',         icon: MessageSquare   },
  { path: '/profile',          label: 'Profile',          icon: User            },
];

const roleNavMap: Record<UserRole, NavItem[]> = {
  customer:     customerNav,
  professional: professionalNav,
  employer:     employerNav,
};

const roleCTA: Record<UserRole, { title: string; desc: string; btnLabel: string }> = {
  customer: {
    title: 'Become a Teacher',
    desc: 'Share your skill and earn in your neighbourhood.',
    btnLabel: 'Start Teaching',
  },
  professional: {
    title: 'Boost Your Profile',
    desc: 'Get verified to unlock more learners.',
    btnLabel: 'Get Verified',
  },
  employer: {
    title: 'Post a Job',
    desc: 'Find verified skill professionals fast.',
    btnLabel: 'Post Now',
  },
};

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, role, profile } = useAuth();

  const navItems = isAuthenticated && role ? roleNavMap[role] : guestNav;
  const cta = role ? roleCTA[role] : null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
          <Zap size={18} color="white" strokeWidth={2.5} />
        </div>
        <div>
          <span className="text-lg font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#111827' }}>
            SkillSeekho
          </span>
          <p className="text-xs text-gray-400 leading-none mt-0.5 capitalize">
            {role ?? 'Guest'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="ml-auto md:hidden text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Profile chip — only when logged in */}
      {isAuthenticated && profile && (
        <div className="mx-3 mt-3 px-3 py-2.5 rounded-xl bg-gray-50 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
            {profile.name ? profile.name[0].toUpperCase() : '?'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{profile.name ?? 'Set up profile'}</p>
            {profile.verified && (
              <span className="text-[10px] text-green-600 font-medium">✓ Verified</span>
            )}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(path);

          return (
            <NavLink key={path} to={path} onClick={onClose} className="block">
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  color={isActive ? '#16A34A' : 'currentColor'}
                />
                <span className={isActive ? 'text-green-700' : ''}>{label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto text-green-500" />}
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-4 pb-3 pt-2 border-t border-gray-100">
        {isAuthenticated && cta ? (
          <>
            {/* Role CTA card */}
            <div className="rounded-2xl p-4 mb-3"
              style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: '1px solid #BBF7D0' }}>
              <p className="text-xs font-semibold text-green-800 mb-1">{cta.title}</p>
              <p className="text-xs text-green-700 mb-3 leading-relaxed">{cta.desc}</p>
              <button
                className="w-full text-xs font-semibold text-white rounded-lg py-2 transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
              >
                {cta.btnLabel}
              </button>
            </div>
            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="w-full text-xs font-medium text-gray-400 hover:text-red-500 transition-colors py-1"
            >
              Sign out
            </button>
          </>
        ) : (
          /* Guest — Login / Sign Up CTA */
          <div className="rounded-2xl p-4"
            style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: '1px solid #BBF7D0' }}>
            <p className="text-xs font-semibold text-green-800 mb-1">Join SkillSeekho</p>
            <p className="text-xs text-green-700 mb-3 leading-relaxed">
              Find local teachers, share your skills, or hire professionals.
            </p>
            <button
              onClick={() => { navigate('/auth'); onClose(); }}
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-white rounded-lg py-2 transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
            >
              <LogIn size={13} />
              Login / Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full bg-white border-r border-gray-100 z-30"
        style={{ width: '260px' }}>
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={onClose}
            />
            <motion.aside
              key="drawer"
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full bg-white z-50 md:hidden flex flex-col"
              style={{ width: '260px' }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
