import { supabase } from '../supabase';
import type { Profile, UserRole } from '../../types';

// ── Email + Password ──────────────────────────

export async function signUpWithEmail(params: {
  email: string;
  password: string;
  role: UserRole;
  name: string;
}) {
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
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
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
