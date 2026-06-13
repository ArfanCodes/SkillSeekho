import { GraduationCap, Mic2, Briefcase } from 'lucide-react';
import type { UserRole } from '../../types';

export interface AuthTheme {
  role: UserRole;
  label: string;            // "Learner"
  icon: React.ElementType;
  from: string;             // gradient start
  to: string;               // gradient end
  accent: string;           // solid accent (text / borders)
  soft: string;             // soft tint background
  softBorder: string;
  eyebrow: string;          // small uppercase tag
  signInTitle: string;
  signUpTitle: string;
  tagline: string;          // shown on the branded panel
  perks: string[];
  nameLabel: string;        // label for the name field on signup
  namePlaceholder: string;
}

export const AUTH_THEMES: Record<UserRole, AuthTheme> = {
  customer: {
    role: 'customer',
    label: 'Learner',
    icon: GraduationCap,
    from: '#3B82F6',
    to: '#2563EB',
    accent: '#2563EB',
    soft: '#EFF6FF',
    softBorder: '#BFDBFE',
    eyebrow: 'For Learners',
    signInTitle: 'Welcome back, learner',
    signUpTitle: 'Start learning today',
    tagline: 'Find local teachers and book skill sessions near you — in your own language.',
    perks: [
      'Browse 340+ neighbourhood skills',
      'Book verified teachers nearby',
      'Search by voice in Hindi, Telugu & more',
    ],
    nameLabel: 'Your Name',
    namePlaceholder: 'e.g. Aarav Sharma',
  },
  professional: {
    role: 'professional',
    label: 'Teacher',
    icon: Mic2,
    from: '#22C55E',
    to: '#16A34A',
    accent: '#16A34A',
    soft: '#F0FDF4',
    softBorder: '#BBF7D0',
    eyebrow: 'For Teachers',
    signInTitle: 'Welcome back, teacher',
    signUpTitle: 'Teach a skill, earn locally',
    tagline: 'Share what you know with your neighbourhood and get paid for every session.',
    perks: [
      'Set your own price per session',
      'Manage your own schedule',
      'Earn community vouches & reviews',
    ],
    nameLabel: 'Your Name',
    namePlaceholder: 'e.g. Priya Reddy',
  },
  employer: {
    role: 'employer',
    label: 'Employer',
    icon: Briefcase,
    from: '#F59E0B',
    to: '#D97706',
    accent: '#D97706',
    soft: '#FFFBEB',
    softBorder: '#FDE68A',
    eyebrow: 'For Employers',
    signInTitle: 'Welcome back',
    signUpTitle: 'Hire skilled professionals',
    tagline: 'Find verified skill professionals for your business — post jobs in minutes.',
    perks: [
      'Browse verified skill professionals',
      'Post jobs in under 2 minutes',
      'Message candidates directly',
    ],
    nameLabel: 'Contact Person',
    namePlaceholder: 'Your name',
  },
};

export const isValidRole = (r: string | undefined): r is UserRole =>
  r === 'customer' || r === 'professional' || r === 'employer';
