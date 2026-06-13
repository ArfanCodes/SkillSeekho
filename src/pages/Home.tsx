import HeroSection from '../components/HeroSection';
import NearbyTeachers from '../components/NearbyTeachers';
import PopularSkills from '../components/PopularSkills';
import CommunityTrust from '../components/CommunityTrust';

export default function Home() {
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
