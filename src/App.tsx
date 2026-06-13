import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import MainLayout from './layouts/MainLayout';

// Auth pages
import AuthLanding  from './pages/auth/AuthLanding';
import SignIn       from './pages/auth/SignIn';
import SignUp       from './pages/auth/SignUp';
import RoleSelect   from './pages/auth/RoleSelect';
import ProfileSetup from './pages/auth/ProfileSetup';

// Public pages (no login needed)
import Home             from './pages/Home';
import Discover         from './pages/Discover';
import VoiceOnboarding  from './pages/VoiceOnboarding';
import SkillArchive     from './pages/SkillArchive';

// Protected pages (login required)
import Payments from './pages/Payments';
import Messages from './pages/Messages';
import Profile  from './pages/Profile';

// Professional pages
import ProDashboard from './pages/professional/Dashboard';
import ProSkills    from './pages/professional/MySkills';
import ProBookings  from './pages/professional/Bookings';
import ProEarnings  from './pages/professional/Earnings';

// Employer pages
import EmpDashboard from './pages/employer/Dashboard';
import EmpPostJob   from './pages/employer/PostJob';
import EmpTeachers  from './pages/employer/BrowseTeachers';
import EmpJobs      from './pages/employer/MyJobs';

// ── Requires login — redirects to /auth if not signed in
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

// ── Requires completed onboarding (role + profile setup done)
function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, needsRoleSelection, needsOnboarding, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (needsRoleSelection) return <Navigate to="/auth/role" replace />;
  if (needsOnboarding) return <Navigate to="/auth/setup" replace />;
  return <>{children}</>;
}

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
          <span className="text-white font-black text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>S</span>
        </div>
        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, needsRoleSelection, needsOnboarding, loading } = useAuth();
  if (loading) return <FullScreenLoader />;

  return (
    <Routes>
      {/* ── Auth flow ──────────────────────────────────────────── */}
      <Route path="/auth" element={
        isAuthenticated && !needsRoleSelection && !needsOnboarding
          ? <Navigate to="/" replace />
          : <AuthLanding />
      } />
      <Route path="/auth/:role/login"  element={
        isAuthenticated && !needsRoleSelection && !needsOnboarding
          ? <Navigate to="/" replace />
          : <SignIn />
      } />
      <Route path="/auth/:role/signup" element={
        isAuthenticated && !needsRoleSelection && !needsOnboarding
          ? <Navigate to="/" replace />
          : <SignUp />
      } />
      <Route path="/auth/role"  element={<RequireAuth><RoleSelect /></RequireAuth>} />
      <Route path="/auth/setup" element={<RequireAuth><ProfileSetup /></RequireAuth>} />

      {/* ── PUBLIC routes — anyone can browse ─────────────────── */}
      <Route element={<MainLayout />}>
        <Route path="/"         element={<Home />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/voice"    element={<VoiceOnboarding />} />
        <Route path="/archive"  element={<SkillArchive />} />
        <Route path="/profile"  element={<Profile />} />
      </Route>

      {/* ── PROTECTED routes — login required ─────────────────── */}
      <Route element={<RequireOnboarding><MainLayout /></RequireOnboarding>}>
        {/* Shared */}
        <Route path="/messages" element={<Messages />} />
        <Route path="/payments" element={<Payments />} />

        {/* Professional */}
        <Route path="/pro"          element={<ProDashboard />} />
        <Route path="/pro/skills"   element={<ProSkills />} />
        <Route path="/pro/bookings" element={<ProBookings />} />
        <Route path="/pro/earnings" element={<ProEarnings />} />

        {/* Employer */}
        <Route path="/employer"          element={<EmpDashboard />} />
        <Route path="/employer/post"     element={<EmpPostJob />} />
        <Route path="/employer/teachers" element={<EmpTeachers />} />
        <Route path="/employer/jobs"     element={<EmpJobs />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
