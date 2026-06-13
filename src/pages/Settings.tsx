import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Shield, Globe, Moon, ChevronRight, User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { signOut } from '../lib/api/auth';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: User,   label: 'Edit Profile',      desc: 'Update your name, photo and bio' },
        { icon: Globe,  label: 'Language & Region',  desc: 'Hindi, English, Tamil + more' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell,  label: 'Notifications', desc: 'Session reminders, vouches, messages' },
        { icon: Moon,  label: 'Appearance',    desc: 'Light, dark or system default' },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        { icon: Shield, label: 'Privacy Settings', desc: 'Control who can see your profile' },
      ],
    },
  ];

  return (
    <div className="min-h-screen px-6 py-14">
      <div className="max-w-xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Settings</h1>
          <p className="text-gray-500">Manage your account and preferences.</p>
        </motion.div>

        {/* Profile card */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 flex items-center gap-4 mb-8 card-shadow"
          style={{ border: '1px solid #F3F4F6' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold"
            style={{ backgroundColor: '#22C55E' }}>
            {profile?.name ? profile.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <p className="font-bold text-gray-900">{profile?.name ?? 'Your Name'}</p>
            <p className="text-sm text-gray-500">{profile?.phone ?? ''}</p>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block capitalize"
              style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
              {profile?.verified ? '✓ Verified' : ''} {profile?.role ?? 'Learner'}
            </span>
          </div>
          <ChevronRight size={18} className="ml-auto text-gray-400" />
        </motion.div>

        {sections.map((section, si) => (
          <motion.div key={section.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: si * 0.08 }} className="mb-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
              {section.title}
            </h2>
            <div className="bg-white rounded-2xl overflow-hidden card-shadow" style={{ border: '1px solid #F3F4F6' }}>
              {section.items.map((item, ii) => (
                <button key={item.label}
                  className={`w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left ${
                    ii < section.items.length - 1 ? 'border-b border-gray-50' : ''
                  }`}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#F9FAFB' }}>
                    <item.icon size={17} className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <ChevronRight size={15} className="text-gray-300" />
                </button>
              ))}
            </div>
          </motion.div>
        ))}

        <button onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-red-500 font-semibold text-sm border border-red-100 bg-white hover:bg-red-50 transition-colors">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}
