import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import HeroSection from '../components/HeroSection';
import NearbyTeachers from '../components/NearbyTeachers';
import PopularSkills from '../components/PopularSkills';
import CommunityTrust from '../components/CommunityTrust';

export default function Home() {
  const { isAuthenticated, profile } = useAuth();

  if (isAuthenticated && profile?.role === 'professional') return <Navigate to="/pro" replace />;
  if (isAuthenticated && profile?.role === 'employer')     return <Navigate to="/employer" replace />;

  return (
    <div className="min-h-screen">
      <HeroSection />
      <NearbyTeachers />
      <PopularSkills />
      <CommunityTrust />
      <div className="h-16" />
    </div>
  );
}
