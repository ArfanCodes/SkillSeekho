import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Discover from './pages/Discover';
import VoiceOnboarding from './pages/VoiceOnboarding';
import CommunityVouches from './pages/CommunityVouches';
import SkillArchive from './pages/SkillArchive';
import EmployerFeed from './pages/EmployerFeed';
import Payments from './pages/Payments';
import Messages from './pages/Messages';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/"          element={<Home />} />
          <Route path="/discover"  element={<Discover />} />
          <Route path="/voice"     element={<VoiceOnboarding />} />
          <Route path="/vouches"   element={<CommunityVouches />} />
          <Route path="/archive"   element={<SkillArchive />} />
          <Route path="/employer"  element={<EmployerFeed />} />
          <Route path="/payments"  element={<Payments />} />
          <Route path="/messages"  element={<Messages />} />
          <Route path="/settings"  element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
