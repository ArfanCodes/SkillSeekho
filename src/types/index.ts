// ─────────────────────────────────────────────
// SkillSeekho — Core TypeScript Types
// ─────────────────────────────────────────────

// ── Auth & Users ──────────────────────────────

export type UserRole = 'customer' | 'professional' | 'employer';

export interface Profile {
  id: string;
  name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole | null;
  bio: string | null;
  languages: string[];
  location_lat: number | null;
  location_lng: number | null;
  location_name: string | null;
  verified: boolean;
  onboarding_complete: boolean;
  // professional fields
  availability: string | null;
  // employer fields
  company_name: string | null;
  company_type: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

// ── Catalogue: Categories & Skills ────────────

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;          // lucide-react icon name
  color: string;
  bg: string;
  image_url: string | null;
  sort_order: number;
  active: boolean;
  count?: number;        // joined from category_skill_counts view
}

export interface Skill {
  id: string;
  teacher_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  price_per_session: number;   // whole rupees
  currency: string;
  tags: string[];
  languages: string[];
  availability: string | null;
  location_name: string | null;
  location_lat: number | null;
  location_lng: number | null;
  cover_image_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Row shape returned by the nearby_skills() RPC: skill + teacher + aggregates.
export interface SkillWithTeacher {
  id: string;
  teacher_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  price_per_session: number;
  currency: string;
  tags: string[];
  languages: string[];
  availability: string | null;
  location_name: string | null;
  location_lat: number | null;
  location_lng: number | null;
  cover_image_url: string | null;
  teacher_name: string | null;
  teacher_avatar_url: string | null;
  teacher_verified: boolean;
  avg_rating: number;
  review_count: number;
  vouch_count: number;
  distance_km: number | null;
}

export interface SkillFilters {
  lat?: number | null;
  lng?: number | null;
  radiusKm?: number | null;
  categoryId?: string | null;
  maxPrice?: number | null;
  verifiedOnly?: boolean;
  search?: string | null;
}

export interface Review {
  id: string;
  skill_id: string;
  teacher_id: string;
  learner_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Vouch {
  id: string;
  teacher_id: string;
  voucher_id: string;
  note: string | null;
  created_at: string;
}

// ── Teachers / Mentors (legacy mock shape) ────

export interface Mentor {
  id: number;
  name: string;
  avatar: string;
  avatarColor: string;
  photo?: string;
  skill: string;
  category: string;
  distance: string;
  rating: number;
  reviews: number;
  vouches: number;
  pricePerSession: number;
  currency: string;
  verified: boolean;
  languages: string[];
  bio: string;
  availability: string;
  location: string;
  tags: string[];
  badges: string[];
}

// ── Skills ────────────────────────────────────

export interface SkillCategory {
  id: number;
  name: string;
  icon: string;
  count: number;
  color: string;
  bg: string;
  image: string;
}

// ── Testimonials & Stats ──────────────────────

export interface Testimonial {
  id: number;
  learner: string;
  avatar: string;
  avatarColor: string;
  skill: string;
  teacher: string;
  quote: string;
  rating: number;
  date: string;
  location: string;
}

export interface Stat {
  label: string;
  value: string;
  icon: string;
}

// ── Bookings ──────────────────────────────────

export type BookingStatus = 'requested' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  learner_id: string;
  teacher_id: string;
  skill_id: string;
  scheduled_at: string;
  status: BookingStatus;
  price: number;
  payment_id: string | null;
  notes: string | null;
  created_at: string;
}

// ── Messages ──────────────────────────────────

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

// ── Payments ──────────────────────────────────

export type TransactionType = 'credit' | 'debit';

export interface Transaction {
  id: string;
  wallet_id: string;
  type: TransactionType;
  amount: number; // in paise
  label: string;
  reference_id: string | null;
  booking_id: string | null;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number; // in paise
  created_at: string;
  updated_at: string;
}

// ── Employer / Jobs ───────────────────────────

export type JobType = 'full-time' | 'part-time' | 'contract' | 'freelance';

export interface Job {
  id: number;
  company: string;
  role: string;
  skill: string;
  location: string;
  type: JobType;
  pay: string;
  logo: string;
  color: string;
  urgent: boolean;
}

// ── Voice Pipeline ────────────────────────────

export interface SearchIntent {
  mode: 'search';
  skill: string;
  category_slug: string | null;
  maxPrice: number | null;
  area: string | null;
}

export interface ListingIntent {
  mode: 'listing';
  title: string;
  category_slug: string;
  price_per_session: number;
  tags: string[];
  availability: string | null;
  description: string | null;
}

export interface OnboardingIntent {
  mode: 'onboarding';
  profile: {
    name: string;
    bio: string;
    languages: string[];
    location_name: string | null;
    availability: string | null;
  };
  skill: {
    title: string;
    category_slug: string;
    price_per_session: number;
    tags: string[];
    availability: string | null;
  };
}

export interface ProfileIntent {
  mode: 'profile';
  name: string;
  bio: string | null;
  location_name: string | null;
  languages: string[];
  availability: string | null;
}

export type VoiceIntent = SearchIntent | ListingIntent | OnboardingIntent | ProfileIntent;

// ── API Response wrapper ──────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
