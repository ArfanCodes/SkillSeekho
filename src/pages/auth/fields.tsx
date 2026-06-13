import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface TextFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: React.ElementType;
  accent: string;
  autoComplete?: string;
}

export function TextField({
  label, type = 'text', value, onChange, placeholder, icon: Icon, accent, autoComplete,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <div
        className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-gray-50 transition-all"
        style={{ border: `1.5px solid ${focused ? accent : '#E5E7EB'}` }}
      >
        {Icon && <Icon size={16} className="flex-shrink-0" color={focused ? accent : '#9CA3AF'} />}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="flex-1 text-sm text-gray-900 bg-transparent outline-none placeholder-gray-400 min-w-0"
        />
      </div>
    </div>
  );
}

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  accent: string;
  autoComplete?: string;
}

export function PasswordField({
  label, value, onChange, placeholder, accent, autoComplete,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <div
        className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-gray-50 transition-all"
        style={{ border: `1.5px solid ${focused ? accent : '#E5E7EB'}` }}
      >
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="flex-1 text-sm text-gray-900 bg-transparent outline-none placeholder-gray-400 min-w-0"
        />
        <button type="button" onClick={() => setShow((s) => !s)}
          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          aria-label={show ? 'Hide password' : 'Show password'}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export function GoogleButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium text-gray-700 bg-white transition-colors hover:bg-gray-50"
      style={{ border: '1.5px solid #E5E7EB' }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
      </svg>
      {label}
    </button>
  );
}

export function Divider({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{text}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

export function SubmitButton({
  loading, label, from, to,
}: { loading: boolean; label: string; from: string; to: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {loading
        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        : label}
    </button>
  );
}
