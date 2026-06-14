import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Compass, Mic, Heart, Archive, CreditCard,
  MessageSquare, User, Zap, X,
  LayoutDashboard, Star, CalendarCheck, Wallet,
  PlusSquare, Users, ListChecks, LogIn, ChevronLeft, ChevronRight, Briefcase,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { signOut } from '../lib/api/auth';
import type { UserRole } from '../types';
import favicon from '../assets/favicon.png';

// ── Types ─────────────────────────────────────────────────────────────────────
interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

// ── Nav definitions (unchanged) ───────────────────────────────────────────────
const guestNav: NavItem[] = [
  { path: '/',         label: 'Home',            icon: Home    },
  { path: '/discover', label: 'Discover Skills', icon: Compass },
  { path: '/voice',    label: 'Voice Search',    icon: Mic     },
  { path: '/archive',  label: 'Skill Archive',   icon: Archive },
  { path: '/profile',  label: 'Profile',         icon: User    },
];

const customerNav: NavItem[] = [
  { path: '/',         label: 'Home',            icon: Home          },
  { path: '/discover', label: 'Discover Skills', icon: Compass       },
  { path: '/voice',    label: 'Voice Search',    icon: Mic           },
  { path: '/archive',  label: 'Skill Archive',   icon: Archive       },
  { path: '/payments', label: 'Payments',        icon: CreditCard    },
  { path: '/messages', label: 'Messages',        icon: MessageSquare },
];

const professionalNav: NavItem[] = [
  { path: '/pro',          label: 'Dashboard',       icon: LayoutDashboard },
  { path: '/pro/skills',   label: 'My Skills',       icon: Star            },
  { path: '/pro/bookings', label: 'Manage Bookings', icon: CalendarCheck   },
  { path: '/pro/earnings', label: 'Earnings',        icon: Wallet          },
  { path: '/jobs',         label: 'Find Jobs',       icon: Briefcase       },
  { path: '/messages',     label: 'Messages',        icon: MessageSquare   },
];

const employerNav: NavItem[] = [
  { path: '/employer',          label: 'Dashboard',       icon: LayoutDashboard },
  { path: '/employer/post',     label: 'Post a Job',      icon: PlusSquare      },
  { path: '/employer/teachers', label: 'Browse Teachers', icon: Users           },
  { path: '/employer/jobs',     label: 'My Jobs',         icon: ListChecks      },
  { path: '/messages',          label: 'Messages',        icon: MessageSquare   },
];

const roleNavMap: Record<UserRole, NavItem[]> = {
  customer:     customerNav,
  professional: professionalNav,
  employer:     employerNav,
};

const roleCTA: Record<UserRole, { title: string; desc: string; btnLabel: string }> = {
  customer:     { title: 'Become a Teacher',   desc: 'Share your skill and earn in your neighbourhood.', btnLabel: 'Start Teaching' },
  professional: { title: 'Boost Your Profile', desc: 'Get verified to unlock more learners.',            btnLabel: 'Get Verified'   },
  employer:     { title: 'Post a Job',          desc: 'Find verified skill professionals fast.',          btnLabel: 'Post Now'       },
};

// ── Fixed-position tooltip (escapes overflow:hidden on sidebar) ───────────────
function NavTooltip({ label, anchorRef, visible }: { label: string; anchorRef: React.RefObject<HTMLDivElement | null>; visible: boolean }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (visible && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.top + rect.height / 2,
        left: rect.right + 12,
      });
    }
  }, [visible, anchorRef]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -6 }}
          transition={{ duration: 0.15 }}
          role="tooltip"
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            transform: 'translateY(-50%)',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          {/* Arrow */}
          <div style={{
            position: 'absolute',
            left: -4,
            top: '50%',
            transform: 'translateY(-50%) rotate(45deg)',
            width: 8,
            height: 8,
            background: '#111827',
          }} />
          <span style={{
            display: 'block',
            whiteSpace: 'nowrap',
            background: '#111827',
            color: '#ffffff',
            fontSize: 12,
            fontWeight: 600,
            padding: '6px 12px',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            position: 'relative',
          }}>
            {label}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Single nav item ───────────────────────────────────────────────────────────
function NavItemRow({
  path, label, icon: Icon, collapsed, onClick,
}: NavItem & { collapsed: boolean; onClick?: () => void }) {
  const location = useLocation();
  const [hovered, setHovered] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const isActive = path === '/'
    ? location.pathname === '/'
    : location.pathname.startsWith(path);

  return (
    <NavLink to={path} onClick={onClick} className="block" aria-label={label}>
      <motion.div
        ref={anchorRef}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileTap={{ scale: 0.97 }}
        className={`flex items-center rounded-xl transition-colors duration-150 cursor-pointer select-none
          ${collapsed ? 'justify-center w-11 h-11 mx-auto' : 'gap-3 px-3.5 py-2.5'}
          ${isActive
            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
          }
        `}
      >
        <Icon
          size={collapsed ? 19 : 18}
          strokeWidth={isActive ? 2.4 : 1.9}
        />

        {/* Label — only shown expanded */}
        {!collapsed && (
          <span className={`text-sm font-semibold tracking-tight ${isActive ? 'text-white' : ''}`}>
            {label}
          </span>
        )}
      </motion.div>

      {/* Tooltip portal — only shown when collapsed */}
      {collapsed && <NavTooltip label={label} anchorRef={anchorRef} visible={hovered} />}
    </NavLink>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

// ── Main Sidebar ──────────────────────────────────────────────────────────────
export default function Sidebar({ mobileOpen, onClose, onCollapsedChange }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, role, profile } = useAuth();

  // Persist collapse state
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Notify parent after mount (avoids "update during render" warning)
  useEffect(() => { onCollapsedChange?.(collapsed); }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem('sidebar-collapsed', String(next)); } catch {}
      return next;
    });
  };

  // Notify parent whenever collapsed changes
  useEffect(() => { onCollapsedChange?.(collapsed); }, [collapsed]);

  const navItems = isAuthenticated && role ? roleNavMap[role] : guestNav;
  const cta = role ? roleCTA[role] : null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // ── Desktop sidebar width
  const EXPANDED_W = 260;
  const COLLAPSED_W = 72;

  // ── Shared inner content ──────────────────────────────────────────────────
  function SidebarInner({ isDrawer = false }: { isDrawer?: boolean }) {
    return (
      <div className="flex flex-col h-full overflow-hidden">

        {/* ── Logo row ─── */}
        <div className={`flex items-center py-5 border-b border-gray-100 flex-shrink-0 transition-all duration-300
          ${collapsed && !isDrawer ? 'justify-center px-0' : 'gap-3 px-5'}
        `}>
          <img
            src={favicon}
            alt="SkillSeekho Logo"
            className="w-9 h-9 rounded-xl object-contain flex-shrink-0"
          />

          {(!collapsed || isDrawer) && (
            <motion.div
              initial={false}
              animate={{ opacity: 1 }}
              className="flex-1 min-w-0"
            >
              <span className="text-[17px] font-black tracking-tight text-gray-900 block leading-none"
                style={{ fontFamily: 'Outfit, sans-serif' }}>
                SkillSeekho
              </span>
              <span className="text-[11px] text-gray-400 font-medium capitalize">{role ?? 'Guest'}</span>
            </motion.div>
          )}

          {/* Mobile close */}
          {isDrawer && (
            <button
              onClick={onClose}
              className="ml-auto text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          )}

          {/* Desktop collapse toggle */}
          {!isDrawer && (
            <button
              onClick={toggleCollapsed}
              className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all
                text-gray-400 hover:text-gray-700 hover:bg-gray-100
                ${collapsed ? 'mx-auto mt-0' : 'ml-auto'}
              `}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
          )}
        </div>

        {/* ── Nav items ─── */}
        <nav
          className={`flex-1 overflow-y-auto py-3 space-y-0.5 flex-shrink-0
            ${collapsed && !isDrawer ? 'px-2' : 'px-3'}
          `}
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <NavItemRow
              key={item.path}
              {...item}
              collapsed={collapsed && !isDrawer}
              onClick={isDrawer ? onClose : undefined}
            />
          ))}
        </nav>

        {/* ── Profile chip (bottom) ─── */}
        {isAuthenticated && profile && (
          <div className={`pt-3 border-t border-gray-100 flex-shrink-0
            ${collapsed && !isDrawer ? 'px-2' : 'px-3'}
          `}>
            <NavLink
              to="/profile"
              onClick={isDrawer ? onClose : undefined}
              className={`flex items-center rounded-2xl transition-colors
                ${collapsed && !isDrawer ? 'justify-center w-11 h-11 mx-auto' : 'gap-3 px-3 py-2.5'}
                ${location.pathname.startsWith('/profile')
                  ? 'bg-emerald-50 border border-emerald-200'
                  : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'}
              `}
            >
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name ?? 'User'}
                  className="w-9 h-9 rounded-full object-cover border-2 border-emerald-200 flex-shrink-0"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
                >
                  {profile.name ? profile.name[0].toUpperCase() : 'U'}
                </div>
              )}
              {(!collapsed || isDrawer) && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-800 truncate leading-snug">{profile.name ?? 'Set up profile'}</p>
                  {profile.verified
                    ? <span className="text-[10px] text-emerald-600 font-semibold">✓ Verified</span>
                    : <span className="text-[10px] text-gray-400 font-medium">View profile</span>}
                </div>
              )}
            </NavLink>
          </div>
        )}

        {/* ── Bottom CTA / Auth ─── */}
        <div className={`pb-4 pt-3 flex-shrink-0
          ${collapsed && !isDrawer ? 'px-2' : 'px-4'}
        `}>
          {isAuthenticated && cta ? (
            <>
              {(!collapsed || isDrawer) && (
                <div
                  className="rounded-2xl p-4 mb-3"
                  style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: '1px solid #BBF7D0' }}
                >
                  <p className="text-xs font-bold text-green-800 mb-0.5">{cta.title}</p>
                  <p className="text-xs text-green-700 mb-3 leading-relaxed">{cta.desc}</p>
                  <button
                    className="w-full text-xs font-semibold text-white rounded-xl py-2 transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
                  >
                    {cta.btnLabel}
                  </button>
                </div>
              )}
              <button
                onClick={handleSignOut}
                className={`text-xs font-medium text-gray-400 hover:text-red-500 transition-colors py-1 w-full
                  ${collapsed && !isDrawer ? 'text-center' : 'text-left px-1'}
                `}
              >
                {collapsed && !isDrawer ? '↩' : 'Sign out'}
              </button>
            </>
          ) : (
            /* Guest CTA */
            (!collapsed || isDrawer) ? (
              <div
                className="rounded-2xl p-4"
                style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: '1px solid #BBF7D0' }}
              >
                <p className="text-xs font-bold text-green-800 mb-0.5">Join SkillSeekho</p>
                <p className="text-xs text-green-700 mb-3 leading-relaxed">
                  Find local teachers, share your skills, or hire professionals.
                </p>
                <button
                  onClick={() => { navigate('/auth'); onClose(); }}
                  className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-white rounded-xl py-2 transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
                >
                  <LogIn size={13} />
                  Login / Sign Up
                </button>
              </div>
            ) : (
              /* Collapsed guest: icon login button */
              <button
                onClick={() => { navigate('/auth'); }}
                className="w-11 h-11 mx-auto flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                aria-label="Login / Sign Up"
              >
                <LogIn size={18} />
              </button>
            )
          )}
        </div>

      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Desktop collapsible sidebar ── */}
      <motion.aside
        animate={{ width: collapsed ? COLLAPSED_W : EXPANDED_W }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="hidden md:flex flex-col fixed left-0 top-0 h-full bg-white border-r border-gray-100 z-30 overflow-visible"
        aria-label="Sidebar navigation"
      >
        <SidebarInner />
      </motion.aside>

      {/* ── Mobile slide-out drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
              onClick={onClose}
            />
            <motion.aside
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed left-0 top-0 h-full bg-white z-50 md:hidden flex flex-col shadow-2xl"
              style={{ width: EXPANDED_W }}
              aria-label="Mobile navigation drawer"
            >
              <SidebarInner isDrawer />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
