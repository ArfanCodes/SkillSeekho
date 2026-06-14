# CLAUDE.md

Guidance for working in the SkillSeekho codebase.

## What this is

SkillSeekho is a hyperlocal skill-marketplace web app for India. Learners discover and
book neighbourhood teachers; teachers list skills and earn; employers post jobs and hire
verified professionals. A voice-onboarding pipeline lets users search and create listings
by speaking in Indian languages (Hindi, Telugu, etc.).

Single-page React app (Vite + TypeScript), Supabase backend (Postgres + Auth + Storage +
Edge Functions), Razorpay payments, deployed to Firebase Hosting.

## Commands

```bash
npm run dev      # Vite dev server on http://localhost:5173
npm run build    # tsc -b && vite build  →  dist/
npm run lint     # eslint .
npm run preview  # serve the production build locally
```

There is no test suite. Validate changes with `npm run build` (type-checks via `tsc -b`)
and `npm run lint`.

## Architecture

- **Entry**: `src/main.tsx` wraps `<App>` in a `QueryClientProvider` (React Query, 5-min
  staleTime, no refetch-on-focus). `src/App.tsx` holds all routing.
- **Routing** (`react-router-dom` v7): three guard wrappers in `App.tsx` —
  `RequireAuth` (login), `RequireOnboarding` (login + role + profile done), and
  `RoleMatchRedirect` (only auto-redirects off the auth page when profile role matches the
  URL role). Public routes (`/`, `/discover`, `/skill/:id`, `/voice`, `/archive`,
  `/profile`) render under `MainLayout` with no login. Protected routes are grouped by role
  (`/pro/*`, `/employer/*`).
- **Roles**: `UserRole = 'customer' | 'professional' | 'employer'` (UI labels: Learner /
  Teacher / Employer). Role config — themes, home routes, validation — lives in
  `src/pages/auth/authConfig.ts` (`ROLE_HOME`, `AUTH_THEMES`, `isValidRole`).
- **Auth**: `src/contexts/AuthContext.tsx` owns the Supabase session/user/profile and
  exposes it; consume it via the `useAuth()` hook (`src/hooks/useAuth.ts`), which derives
  `isAuthenticated`, `needsOnboarding`, `needsRoleSelection`, `isCustomer/isProfessional/
  isEmployer`. Always read auth state through `useAuth()`, not the context directly.

### Data layer

- `src/lib/supabase.ts` — single Supabase client. Falls back to placeholder URL/key when
  `.env` is missing so the app still renders.
- `src/lib/api/*.ts` — one module per domain (`auth`, `catalogue`, `bookings`, `messages`,
  `payments`, `jobs`, `voice`). These are the only place that talks to Supabase.
- `src/hooks/queries/*.ts` — React Query wrappers (`useCatalogue`, `useBookings`,
  `useMessages`, `useWallet`, `useJobs`, `useYoutube`) around the api modules. Components
  consume hooks, not api modules directly.
- `src/types/index.ts` — all shared types. Match these when shaping data.

### Mock mode (important)

When `VITE_SUPABASE_URL` is unset or contains `placeholder`, the app runs in **mock mode**:
a fake session/profile from `localStorage` and seed data from `src/utils/mockData.ts`.
Each api module checks this independently (`checkMockMode()` / an `isMock` const) and
returns mock data instead of querying Supabase. **When adding a new api function, handle
the mock-mode branch too** so local dev without keys keeps working.

### Backend (Supabase)

- `supabase/migrations/*.sql` — numbered, ordered schema. Key tables: `profiles`,
  `categories`, `skills`, `reviews`, `vouches`, `bookings`, `conversations`/`messages`,
  `wallets`/`transactions`, `jobs`/job applications. Catalogue browse goes through the
  `nearby_skills()` RPC (geo + filters). Add new schema as the next numbered migration.
- `supabase/functions/{transcribe,extract-intent}` — Deno edge functions for the voice
  pipeline. `transcribe` → Sarvam (Indic) / Groq (English) STT; `extract-intent` → LLM
  that turns a transcript into a typed `VoiceIntent` (search / listing / onboarding /
  profile). Called from `src/lib/api/voice.ts`.

## Conventions

- **Mobile-first, always.** Design every layout for ~390px first (Tailwind `xs` default),
  then enhance upward with `sm:`/`md:`/`lg:`. No exceptions.
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite`. Brand accent is green
  (`#22C55E`/`#16A34A`); each role has its own theme gradient in `authConfig.ts`. Icons
  from `lucide-react`. Animations via `framer-motion`.
- **Import alias**: `@/` → `src/` (see `vite.config.ts`).
- **Money**: skill prices are whole rupees (`price_per_session`); wallet/transaction
  amounts are in **paise**. Don't mix the two.
- **No fabricated UI data.** Every stat, count, or field shown must map to a real
  column/RPC or seeded mock data — no invented deltas or filler.
- **Forms**: `react-hook-form` + `zod` (`@hookform/resolvers`).
- **Maps**: `leaflet` / `react-leaflet`, tiles configurable via `VITE_MAP_TILE_*` (defaults
  to keyless OSM).

## Environment & secrets

Copy `.env.example` → `.env`. Client-safe vars are `VITE_`-prefixed (Supabase URL/anon key,
`VITE_RAZORPAY_KEY_ID`, optional map + YouTube keys). **Razorpay key secret, Groq, Sarvam,
Gemini, and Razorpay webhook secrets live in Supabase Edge Function secrets — never in
`.env` or any client code.**

## Deploy

Push to `main`/`master` → GitHub Actions (`.github/workflows/firebase-deploy.yml`) builds
with secrets and deploys `dist/` to Firebase Hosting (project `skillseekho-3bb63`). The SPA
rewrite + cache/security headers are in `firebase.json`.
