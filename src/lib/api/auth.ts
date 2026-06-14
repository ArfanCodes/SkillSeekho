import { supabase } from '../supabase';
import type { Profile, UserRole } from '../../types';

// ── Email + Password ──────────────────────────

export async function signUpWithEmail(params: {
  email: string;
  password: string;
  role: UserRole;
  name: string;
}) {
  const isMockMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');
  if (isMockMode) {
    const { email, role, name } = params;
    const defaultUser = {
      id: 'mock-user-id',
      email: email,
    } as any;

    const defaultProfile: Profile = {
      id: 'mock-user-id',
      name: name,
      phone: '+91 98765 43210',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      role: role,
      bio: 'New user profile.',
      languages: ['English'],
      location_lat: 12.9352,
      location_lng: 77.6245,
      location_name: 'Koramangala, Bangalore',
      verified: true,
      onboarding_complete: true,
      availability: null,
      company_name: null,
      company_type: null,
      website: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const defaultSession = {
      access_token: 'mock-token',
      user: defaultUser,
    } as any;

    localStorage.removeItem('mock_signed_out');
    localStorage.setItem('mock_session', JSON.stringify(defaultSession));
    localStorage.setItem('mock_profile', JSON.stringify(defaultProfile));
    return { user: defaultUser, session: defaultSession };
  }

  const { email, password, role, name } = params;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Carried into raw_user_meta_data → read by the handle_new_user() trigger
      // so the profile is created already stamped with the chosen role + name.
      data: { role, name },
      emailRedirectTo: `${window.location.origin}/auth/${role}/login`,
    },
  });
  if (error) throw new Error(error.message);

  // If email-confirmation is OFF, a session exists immediately. Upsert (not
  // update) so the profile is guaranteed to exist with the chosen role/name,
  // even if the DB trigger couldn't create it.
  if (data.user && data.session) {
    await supabase
      .from('profiles')
      .upsert({ id: data.user.id, role, name }, { onConflict: 'id' });
  }
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const isMockMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');
  if (isMockMode) {
    const defaultUser = {
      id: 'mock-user-id',
      email: email,
    } as any;

    const defaultProfile: Profile = {
      id: 'mock-user-id',
      name: email.split('@')[0],
      phone: '+91 98765 43210',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      role: 'customer',
      bio: 'Aspiring coder.',
      languages: ['English'],
      location_lat: 12.9352,
      location_lng: 77.6245,
      location_name: 'Koramangala, Bangalore',
      verified: true,
      onboarding_complete: true,
      availability: null,
      company_name: null,
      company_type: null,
      website: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const defaultSession = {
      access_token: 'mock-token',
      user: defaultUser,
    } as any;

    localStorage.removeItem('mock_signed_out');
    localStorage.setItem('mock_session', JSON.stringify(defaultSession));
    localStorage.setItem('mock_profile', JSON.stringify(defaultProfile));
    return { user: defaultUser, session: defaultSession };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

// ── Google OAuth ──────────────────────────────

export async function signInWithGoogle(role?: UserRole) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
      // Hint the desired role for new Google users; falls back to role-select if absent.
      ...(role ? { queryParams: { role } } : {}),
    },
  });
  if (error) throw new Error(error.message);
}

// ── Sign Out ──────────────────────────────────

export async function signOut() {
  const isMockMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');
  if (isMockMode) {
    localStorage.setItem('mock_signed_out', 'true');
    localStorage.removeItem('mock_session');
    localStorage.removeItem('mock_profile');
    // Force a hard reload so the AuthContext state updates and redirects correctly
    window.location.href = '/';
    return;
  }
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

// ── Profile ───────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    throw new Error(error.message);
  }
  return data as Profile;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
): Promise<Profile> {
  const isMockMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');
  if (isMockMode) {
    const savedProfile = localStorage.getItem('mock_profile');
    const currentProfile = savedProfile ? JSON.parse(savedProfile) : {};
    const updated = { ...currentProfile, ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem('mock_profile', JSON.stringify(updated));
    return updated as Profile;
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Profile;
}

// Upsert: update if a profile row exists, otherwise create it. Used for the
// admin account, whose auth user may exist without a profiles row.
export async function upsertProfile(
  userId: string,
  fields: Partial<Omit<Profile, 'created_at' | 'updated_at'>>
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...fields }, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Profile;
}

export async function setRole(userId: string, role: UserRole): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) throw new Error(error.message);
}

export async function completeOnboarding(
  userId: string,
  profileData: Partial<Profile>
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...profileData, onboarding_complete: true })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Profile;
}
