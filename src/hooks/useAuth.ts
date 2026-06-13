import { useAuthContext } from '../contexts/AuthContext';
import type { UserRole } from '../types';

export function useAuth() {
  const { session, user, profile, loading, refreshProfile } = useAuthContext();

  const isAuthenticated = !!session && !!user;
  const role: UserRole | null = profile?.role ?? null;
  const needsOnboarding = isAuthenticated && !profile?.onboarding_complete;
  const needsRoleSelection = isAuthenticated && !profile?.role;

  return {
    session,
    user,
    profile,
    loading,
    isAuthenticated,
    role,
    needsOnboarding,
    needsRoleSelection,
    refreshProfile,
    isCustomer: role === 'customer',
    isProfessional: role === 'professional',
    isEmployer: role === 'employer',
  };
}
