import { useState } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { Mail, User } from 'lucide-react';
import { signUpWithEmail, signInWithGoogle } from '../../lib/api/auth';
import { AUTH_THEMES, isValidRole } from './authConfig';
import AuthShell from './AuthShell';
import { TextField, PasswordField, GoogleButton, Divider, SubmitButton } from './fields';

export default function SignUp() {
  const { role } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmSent, setConfirmSent] = useState(false);

  if (!isValidRole(role)) return <Navigate to="/auth" replace />;
  const theme = AUTH_THEMES[role];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Enter your name.'); return; }
    if (!email.trim()) { setError('Enter your email.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      const data = await signUpWithEmail({
        email: email.trim(), password, role, name: name.trim(),
      });
      // Email-confirmation ON → no session yet; show "check your inbox".
      if (!data.session) {
        setConfirmSent(true);
        return;
      }
      // Confirmation OFF → session is live; continue to profile setup.
      navigate('/auth/setup', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not create account. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await signInWithGoogle(role);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-up failed.');
    }
  };

  if (confirmSent) {
    return (
      <AuthShell theme={theme}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
          style={{ backgroundColor: theme.soft, border: `1px solid ${theme.softBorder}` }}>
          <Mail size={24} color={theme.accent} />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Check your inbox
        </h1>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          We sent a confirmation link to <span className="font-semibold text-gray-700">{email.trim()}</span>.
          Click it to activate your {theme.label.toLowerCase()} account, then sign in.
        </p>
        <Link to={`/auth/${role}/login`}
          className="inline-flex items-center justify-center w-full py-3.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}>
          Go to Sign In
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell theme={theme}>
      <h1 className="text-2xl font-black text-gray-900 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
        {theme.signUpTitle}
      </h1>
      <p className="text-sm text-gray-500 mb-7">Create your {theme.label.toLowerCase()} account — it's free.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label={theme.nameLabel} value={name} onChange={setName}
          placeholder={theme.namePlaceholder} icon={User} accent={theme.accent}
          autoComplete="name"
        />
        <TextField
          label="Email" type="email" value={email} onChange={setEmail}
          placeholder="you@example.com" icon={Mail} accent={theme.accent}
          autoComplete="email"
        />
        <PasswordField
          label="Password" value={password} onChange={setPassword}
          placeholder="At least 6 characters" accent={theme.accent}
          autoComplete="new-password"
        />

        {error && <p className="text-xs text-red-500">{error}</p>}

        <SubmitButton loading={loading} label={`Create ${theme.label} Account`} from={theme.from} to={theme.to} />
      </form>

      <Divider text="or" />
      <GoogleButton onClick={handleGoogle} label="Sign up with Google" />

      <p className="text-center text-sm text-gray-500 mt-7">
        Already have an account?{' '}
        <Link to={`/auth/${role}/login`} className="font-semibold hover:underline" style={{ color: theme.accent }}>
          Sign in
        </Link>
      </p>

      <p className="text-center text-[11px] text-gray-400 mt-4 leading-relaxed">
        By creating an account you agree to our{' '}
        <span style={{ color: theme.accent }} className="cursor-pointer">Terms</span> &{' '}
        <span style={{ color: theme.accent }} className="cursor-pointer">Privacy Policy</span>.
      </p>
    </AuthShell>
  );
}
