import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, Zap } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col md:ml-[260px] min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
              <Zap size={13} color="white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              SkillSeekho
            </span>
          </div>
          <div className="ml-auto">
            {isAuthenticated && role ? (
              <span className="text-xs font-medium px-2 py-1 rounded-full capitalize"
                style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
                {role}
              </span>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="text-xs font-semibold px-3 py-1.5 rounded-full text-white"
                style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
              >
                Login
              </button>
            )}
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
