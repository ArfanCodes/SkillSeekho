import { supabase } from '../supabase';
import type { VoiceIntent } from '../../types';

export interface TranscribeResult {
  transcript: string;
  language: string;
  provider: 'sarvam' | 'groq';
}

const isMock =
  !import.meta.env.VITE_SUPABASE_URL ||
  (import.meta.env.VITE_SUPABASE_URL as string).includes('placeholder');

export async function transcribeAudio(
  audioBlob: Blob,
  langHint = '',
): Promise<TranscribeResult> {
  // Mock mode — no real keys needed during local dev with placeholder .env
  if (isMock) {
    await new Promise((r) => setTimeout(r, 1600));
    const isIndic = langHint && langHint !== 'en';
    return {
      transcript: isIndic
        ? 'मुझे कोरमंगला के पास गिटार सीखना है'
        : 'I want to learn guitar near Koramangala under 500 rupees',
      language: isIndic ? `${langHint}-IN` : 'en',
      provider: isIndic ? 'sarvam' : 'groq',
    };
  }

  const session = (await supabase.auth.getSession()).data.session;
  const token =
    session?.access_token ?? (import.meta.env.VITE_SUPABASE_ANON_KEY as string);

  const form = new FormData();
  form.append(
    'audio',
    new File([audioBlob], 'audio.webm', { type: audioBlob.type || 'audio/webm' }),
  );
  if (langHint) form.append('lang_hint', langHint);

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL as string}/functions/v1/transcribe`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
      },
      body: form,
      signal: AbortSignal.timeout(40_000),
    },
  );

  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`Transcription failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  if (data.error) throw new Error(data.error as string);
  return data as TranscribeResult;
}

// ── extract-intent ────────────────────────────────

export async function extractIntent(
  transcript: string,
  language: string,
  mode: 'search' | 'listing' | 'onboarding' | 'profile',
): Promise<VoiceIntent> {
  if (isMock) {
    await new Promise((r) => setTimeout(r, 1400));
    if (mode === 'profile') {
      return {
        mode: 'profile',
        name: 'Demo User',
        bio: 'Passionate learner based in Bangalore.',
        location_name: 'Koramangala, Bangalore',
        languages: ['Hindi', 'English'],
        availability: 'Weekends',
      } satisfies VoiceIntent;
    }
    if (mode === 'search') {
      return {
        mode: 'search',
        skill: 'Guitar lessons',
        category_slug: 'music',
        maxPrice: 500,
        area: 'Koramangala',
      } satisfies VoiceIntent;
    }
    if (mode === 'listing') {
      return {
        mode: 'listing',
        title: 'Guitar & Music Theory',
        category_slug: 'music',
        price_per_session: 400,
        tags: ['Acoustic', 'Bollywood', 'Beginners'],
        languages: ['Hindi', 'English'],
        location_name: 'Koramangala, Bangalore',
        availability: 'Weekends',
        description: 'Learn acoustic and Bollywood guitar from scratch.',
      } satisfies VoiceIntent;
    }
    // onboarding
    return {
      mode: 'onboarding',
      profile: {
        name: 'Demo Teacher',
        bio: 'Experienced music teacher with 5 years of teaching guitar.',
        languages: ['Hindi', 'English'],
        location_name: 'Koramangala, Bangalore',
        availability: 'Weekends',
      },
      skill: {
        title: 'Guitar & Music Theory',
        category_slug: 'music',
        price_per_session: 400,
        tags: ['Acoustic', 'Bollywood', 'Beginners'],
        availability: 'Weekends',
      },
    } satisfies VoiceIntent;
  }

  const session = (await supabase.auth.getSession()).data.session;
  const token =
    session?.access_token ?? (import.meta.env.VITE_SUPABASE_ANON_KEY as string);

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL as string}/functions/v1/extract-intent`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript, language, mode }),
      signal: AbortSignal.timeout(30_000),
    },
  );

  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`Intent extraction failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  if (data.error) throw new Error(data.error as string);
  return data as VoiceIntent;
}
