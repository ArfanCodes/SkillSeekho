import HeroSection from '../components/HeroSection';
import NearbyTeachers from '../components/NearbyTeachers';
import CommunityTrust from '../components/CommunityTrust';
import PopularSkills from '../components/PopularSkills';

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <NearbyTeachers />
      <PopularSkills />
      <CommunityTrust />

      {/* Bottom padding */}
      <div className="h-16" />
    </div>
  );
}
