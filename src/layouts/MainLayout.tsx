import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, Zap } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import LocationPrompt from '../components/LocationPrompt';
import { useAuth } from '../hooks/useAuth';

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, role, profile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      <LocationPrompt />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col md:ml-[260px] min-w-0">
        {/* Global top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-8 py-3 bg-white border-b border-gray-100">
          {/* Mobile menu trigger + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors md:hidden"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
                <Zap size={13} color="white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                SkillSeekho
              </span>
            </div>
          </div>

          {/* Right actions (Auth buttons or Profile chip) */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate('/auth')}
                  className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5"
                >
                  Log in
                </button>
                <button
                  onClick={() => navigate('/auth')}
                  className="text-sm font-semibold text-white rounded-xl px-4 py-2 transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
                >
                  Sign up
                </button>
              </>
            ) : (
              <div 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 animate-fade-in"
              >
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.name ?? 'User'} 
                    className="w-6 h-6 rounded-full object-cover border border-green-500"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
                    {profile?.name ? profile.name[0].toUpperCase() : 'U'}
                  </div>
                )}
                <span className="text-xs font-semibold text-gray-700 hidden sm:inline">{profile?.name ?? 'User'}</span>
              </div>
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
