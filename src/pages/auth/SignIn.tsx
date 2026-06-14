import { useState } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { signInWithEmail, signInWithGoogle, signOut, getProfile, upsertProfile } from '../../lib/api/auth';
import { AUTH_THEMES, isValidRole, ADMIN_EMAIL, ROLE_HOME } from './authConfig';
import { useAuth } from '../../hooks/useAuth';
import AuthShell from './AuthShell';
import { TextField, PasswordField, GoogleButton, Divider, SubmitButton } from './fields';
import type { UserRole } from '../../types';

export default function SignIn() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isValidRole(role)) return <Navigate to="/auth" replace />;
  const theme = AUTH_THEMES[role];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const data = await signInWithEmail(email.trim(), password);
      const isAdmin = email.trim().toLowerCase() === ADMIN_EMAIL;

      if (!isAdmin) {
        // Fetch the profile and enforce role match
        const profile = await getProfile(data.user.id);
        if (!profile) throw new Error('Account not found. Please sign up first.');

        if (profile.role !== role) {
          // Wrong door — sign them back out immediately
          await signOut();
          const correctLabel = AUTH_THEMES[profile.role as UserRole]?.label ?? profile.role;
          throw new Error(
            `This account is registered as a ${correctLabel}. Please use the ${correctLabel} login instead.`
          );
        }

        navigate(ROLE_HOME[profile.role as UserRole] ?? '/', { replace: true });
      } else {
        // Admin: log in through any interface → become that role and land on its dashboard.
        // Stamp the profile so the route guards (which read role + onboarding_complete)
        // let the admin straight through instead of bouncing to role-select/onboarding.
        await upsertProfile(data.user.id, {
          role,
          name: 'Admin',
          onboarding_complete: true,
          verified: true,
        });
        await refreshProfile();
        navigate(ROLE_HOME[role] ?? '/', { replace: true });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not sign in. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await signInWithGoogle(role);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
    }
  };

  return (
    <AuthShell theme={theme}>
      <h1 className="text-2xl font-black text-gray-900 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
        {theme.signInTitle}
      </h1>
      <p className="text-sm text-gray-500 mb-7">Sign in to continue to SkillSeekho.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Email" type="email" value={email} onChange={setEmail}
          placeholder="you@example.com" icon={Mail} accent={theme.accent}
          autoComplete="email"
        />
        <div>
          <PasswordField
            label="Password" value={password} onChange={setPassword}
            placeholder="Your password" accent={theme.accent}
            autoComplete="current-password"
          />
          <div className="flex justify-end mt-1.5">
            <span className="text-xs font-medium cursor-pointer hover:underline" style={{ color: theme.accent }}>
              Forgot password?
            </span>
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <SubmitButton loading={loading} label="Sign In" from={theme.from} to={theme.to} />
      </form>

      <Divider text="or" />
      <GoogleButton onClick={handleGoogle} label="Continue with Google" />

      <p className="text-center text-sm text-gray-500 mt-7">
        New to SkillSeekho?{' '}
        <Link to={`/auth/${role}/signup`} className="font-semibold hover:underline" style={{ color: theme.accent }}>
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
