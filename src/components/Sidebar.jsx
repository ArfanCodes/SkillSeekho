import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Compass,
  Mic,
  Heart,
  Archive,
  Briefcase,
  CreditCard,
  MessageSquare,
  Settings,
  Zap,
  ChevronRight,
  X,
} from 'lucide-react';

const navItems = [
  { path: '/',               label: 'Home',              icon: Home        },
  { path: '/discover',       label: 'Discover Skills',   icon: Compass     },
  { path: '/voice',          label: 'Voice Onboarding',  icon: Mic         },
  { path: '/vouches',        label: 'Community Vouches', icon: Heart       },
  { path: '/archive',        label: 'Skill Archive',     icon: Archive     },
  { path: '/employer',       label: 'Employer Feed',     icon: Briefcase   },
  { path: '/payments',       label: 'Payments',          icon: CreditCard  },
  { path: '/messages',       label: 'Messages',          icon: MessageSquare },
  { path: '/settings',       label: 'Settings',          icon: Settings    },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const location = useLocation();

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
            NearNative
          </span>
          <p className="text-xs text-gray-400 leading-none mt-0.5">Skill Sharing</p>
        </div>
        {/* Mobile close */}
        <button
          onClick={onClose}
          className="ml-auto md:hidden text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(path);

          return (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className="block"
            >
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                  }
                `}
              >
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  color={isActive ? '#16A34A' : 'currentColor'}
                />
                <span className={isActive ? 'text-green-700' : ''}>{label}</span>
                {isActive && (
                  <ChevronRight size={14} className="ml-auto text-green-500" />
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer CTA */}
      <div className="px-4 pb-5 pt-3 border-t border-gray-100">
        <div className="rounded-2xl p-4" style={{
          background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
          border: '1px solid #BBF7D0',
        }}>
          <p className="text-xs font-semibold text-green-800 mb-1">Teach on NearNative</p>
          <p className="text-xs text-green-700 mb-3 leading-relaxed">
            Share your skill and earn in your neighbourhood.
          </p>
          <button
            className="w-full text-xs font-semibold text-white rounded-lg py-2 transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
          >
            Become a Teacher
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-full bg-white border-r border-gray-100 z-30"
        style={{ width: '260px' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay + drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={onClose}
            />
            <motion.aside
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
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
