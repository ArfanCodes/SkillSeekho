import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, RotateCcw, AlertCircle, CheckCircle2, Languages, Search, Compass,
} from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { useCategories } from '../hooks/queries/useCatalogue';
import { nearbySkills } from '../lib/api/catalogue';
import { useRecorder } from '../hooks/useRecorder';
import { transcribeAudio, extractIntent, type TranscribeResult } from '../lib/api/voice';
import SkillTeacherCard from '../components/SkillTeacherCard';
import type { SearchIntent, SkillWithTeacher } from '../types';

// ── Helpers ──────────────────────────────────────────────────────────────

function fmt(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// ── Constants ─────────────────────────────────────────────────────────────

const LANGS: { label: string; hint: string }[] = [
  { label: 'हिन्दी', hint: 'hi' },
  { label: 'English', hint: 'en' },
  { label: 'ಕನ್ನಡ', hint: 'kn' },
  { label: 'தமிழ்', hint: 'ta' },
  { label: 'తెలుగు', hint: 'te' },
];

const EXAMPLES = [
  '"Guitar classes near Koramangala"',
  '"Yoga teacher under ₹500"',
  '"Python coaching in Telugu"',
];

const STAGES = ['Record', 'Transcribe', 'Understand', 'Results'] as const;

const LANG_DISPLAY: Record<string, string> = {
  'hi-IN': 'हिन्दी', 'kn-IN': 'ಕನ್ನಡ', 'ta-IN': 'தமிழ்',
  'te-IN': 'తెలుగు', 'ml-IN': 'മലയാളം', 'mr-IN': 'मराठी',
  'bn-IN': 'বাংলা', 'gu-IN': 'ગুજরাతી', 'pa-IN': 'ਪੰਜਾਬੀ',
  'en': 'English', 'en-IN': 'English', 'unknown': 'Detected',
};

const CAT_LABELS: Record<string, string> = {
  music: '🎵 Music', technology: '💻 Technology', language: '💬 Language',
  wellness: '🌿 Wellness', cooking: '👨‍🍳 Cooking', tailoring: '✂️ Tailoring',
  photography: '📷 Photography', 'art-craft': '🎨 Art & Craft',
};

// ── Phase types ───────────────────────────────────────────────────────────

type PipeStatus     = 'idle' | 'transcribing' | 'done' | 'error';
type UnderStatus    = 'idle' | 'understanding' | 'done' | 'error';
type ResultsStatus  = 'idle' | 'searching' | 'done' | 'error';

type Phase =
  | 'idle' | 'requesting' | 'recording'
  | 'transcribing' | 'understanding' | 'intent'
  | 'searching' | 'results'
  | 'micError' | 'apiError';

// ── Component ─────────────────────────────────────────────────────────────

export default function VoicePage() {
  const geo        = useGeolocation();
  const { data: categories = [] } = useCategories();
  const rec        = useRecorder();

  const [selectedLang, setSelectedLang] = useState('');

  // ── Stage 1: Transcribe ──
  const [pipeStatus, setPipeStatus] = useState<PipeStatus>('idle');
  const [txResult,   setTxResult]   = useState<TranscribeResult | null>(null);
  const txRef = useRef('');

  // ── Stage 2: Extract intent ──
  const [underStatus, setUnderStatus] = useState<UnderStatus>('idle');
  const [intent,      setIntent]      = useState<SearchIntent | null>(null);
  const [editSkill,   setEditSkill]   = useState('');
  const [editArea,    setEditArea]    = useState('');
  const [editMaxPrice,setEditMaxPrice]= useState('');

  // ── Stage 3: Results ──
  const [resultsStatus, setResultsStatus] = useState<ResultsStatus>('idle');
  const [results,       setResults]       = useState<SkillWithTeacher[]>([]);

  // ── Shared error ──
  const [apiError, setApiError] = useState<string | null>(null);
  const abortRef = useRef(false);

  // ── Derived phase ─────────────────────────────────────────────────────
  const phase = useMemo<Phase>(() => {
    if (rec.status === 'error') return 'micError';
    if (apiError)               return 'apiError';
    if (rec.status === 'idle')       return 'idle';
    if (rec.status === 'requesting') return 'requesting';
    if (rec.status === 'recording')  return 'recording';
    if (rec.status === 'stopped') {
      if (pipeStatus === 'transcribing') return 'transcribing';
      if (pipeStatus === 'done') {
        if (underStatus === 'understanding') return 'understanding';
        if (underStatus === 'done') {
          if (resultsStatus === 'searching') return 'searching';
          if (resultsStatus === 'done')      return 'results';
          return 'intent';
        }
      }
    }
    return 'idle';
  }, [rec.status, pipeStatus, underStatus, resultsStatus, apiError]);

  // ── Auto-transcribe ───────────────────────────────────────────────────
  useEffect(() => {
    if (rec.status !== 'stopped' || !rec.audioBlob) return;
    abortRef.current = false;
    setPipeStatus('transcribing');
    setTxResult(null); setIntent(null); setApiError(null);
    setUnderStatus('idle'); setResultsStatus('idle'); setResults([]);

    transcribeAudio(rec.audioBlob, selectedLang)
      .then((r) => {
        if (abortRef.current) return;
        txRef.current = r.transcript;
        setTxResult(r);
        setPipeStatus('done');
      })
      .catch((err: Error) => {
        if (abortRef.current) return;
        setApiError(err.message);
        setPipeStatus('error');
      });
  }, [rec.audioBlob, rec.status, selectedLang]);

  // ── Auto-extract intent ───────────────────────────────────────────────
  useEffect(() => {
    if (pipeStatus !== 'done' || !txResult) return;
    abortRef.current = false;
    setUnderStatus('understanding');

    extractIntent(txRef.current || txResult.transcript, txResult.language, 'search')
      .then((r) => {
        if (abortRef.current) return;
        if (r.mode === 'search') {
          setEditSkill(r.skill);
          setEditArea(r.area ?? '');
          setEditMaxPrice(r.maxPrice != null ? String(r.maxPrice) : '');
          setIntent(r);
        }
        setUnderStatus('done');
      })
      .catch((err: Error) => {
        if (abortRef.current) return;
        setApiError(err.message);
        setUnderStatus('error');
      });
  }, [pipeStatus, txResult]);

  // ── Find skills ───────────────────────────────────────────────────────
  async function handleFindSkills() {
    setResultsStatus('searching');
    const cat = categories.find((c) => c.slug === intent?.category_slug);
    const q   = [editSkill.trim(), editArea.trim()].filter(Boolean).join(' ');
    try {
      const data = await nearbySkills({
        lat:        geo.lat,
        lng:        geo.lng,
        radiusKm:   geo.lat ? 30 : null,
        categoryId: cat?.id ?? null,
        maxPrice:   editMaxPrice ? Number(editMaxPrice) : null,
        search:     q || null,
      });
      setResults(data);
      setResultsStatus('done');
    } catch (err) {
      setApiError((err as Error).message);
      setResultsStatus('error');
    }
  }

  function handleEditSearch() {
    setResultsStatus('idle');
    setResults([]);
  }

  // ── Full reset ───────────────────────────────────────────────────────
  function handleReset() {
    abortRef.current = true;
    rec.reset();
    setPipeStatus('idle');  setTxResult(null);    txRef.current = '';
    setUnderStatus('idle'); setIntent(null);
    setEditSkill('');       setEditArea('');       setEditMaxPrice('');
    setApiError(null);
    setResultsStatus('idle'); setResults([]);
    setTimeout(() => { abortRef.current = false; }, 100);
  }

  // ── Stage dot helpers ─────────────────────────────────────────────────
  function dotColor(i: number): string {
    const p = phase;
    if (i === 0) {
      if (p === 'recording') return '#EF4444';
      if (['transcribing','understanding','intent','searching','results','apiError'].includes(p)) return '#22C55E';
      if (p === 'idle' || p === 'requesting') return '#86EFAC';
      return '#E5E7EB';
    }
    if (i === 1) {
      if (p === 'transcribing') return '#FCD34D';
      if (['understanding','intent','searching','results'].includes(p)) return '#22C55E';
      return '#E5E7EB';
    }
    if (i === 2) {
      if (p === 'understanding') return '#FCD34D';
      if (['intent','searching','results'].includes(p)) return '#22C55E';
      return '#E5E7EB';
    }
    if (i === 3) {
      if (p === 'searching') return '#FCD34D';
      if (p === 'results')   return '#22C55E';
      return '#E5E7EB';
    }
    return '#E5E7EB';
  }

  function dotPulsing(i: number): boolean {
    return (
      (i === 0 && phase === 'recording')     ||
      (i === 1 && phase === 'transcribing')  ||
      (i === 2 && phase === 'understanding') ||
      (i === 3 && phase === 'searching')
    );
  }

  const subtitle: Record<Phase, string> = {
    idle:         'Find a skill by speaking in your language',
    requesting:   'Requesting microphone access…',
    recording:    'Listening — speak clearly, then tap Stop',
    transcribing: 'Transcribing your voice…',
    understanding:'Understanding what you need…',
    intent:       'Here\'s what we understood — edit if needed',
    searching:    'Finding nearby teachers…',
    results:      results.length
      ? `Found ${results.length} ${results.length === 1 ? 'teacher' : 'teachers'}`
      : 'No teachers found',
    micError:     'Microphone unavailable',
    apiError:     'Something went wrong',
  };

  const errorMsg = rec.errorMsg ?? apiError ?? 'An error occurred. Please try again.';

  // Wide layout for results; narrow for the pipeline
  const isWide = phase === 'results' || phase === 'searching';

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className={`flex flex-col items-center w-full mx-auto px-5 pt-10 pb-8 min-h-[calc(100svh-56px)] transition-all duration-300 ${
      isWide ? 'max-w-3xl' : 'max-w-sm'
    }`}>

      {/* ── Header ── */}
      <div className="text-center mb-10 w-full">
        <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Voice <span className="gradient-text">Search</span>
        </h1>
        <AnimatePresence mode="wait">
          <motion.p key={phase}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
            className="text-sm text-gray-500 leading-relaxed">
            {subtitle[phase]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* ── Mic / Status area (hidden in results/searching) ── */}
      <AnimatePresence>
        {!isWide && (
          <motion.div
            initial={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
            className="flex flex-col items-center gap-5 mb-8 w-full overflow-hidden">

            <AnimatePresence mode="wait">

              {/* IDLE */}
              {phase === 'idle' && (
                <motion.button key="idle"
                  initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.25 }}
                  onClick={rec.start}
                  className="relative w-32 h-32 rounded-full flex items-center justify-center text-white focus:outline-none active:scale-95 transition-transform"
                  style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
                  aria-label="Start voice search">
                  <motion.span className="absolute inset-0 rounded-full pointer-events-none"
                    style={{ backgroundColor: 'rgba(34,197,94,0.25)' }}
                    animate={{ scale: [1, 1.35, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }} />
                  <motion.span className="absolute inset-0 rounded-full pointer-events-none"
                    style={{ backgroundColor: 'rgba(34,197,94,0.12)' }}
                    animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2.5, delay: 0.5, ease: 'easeInOut' }} />
                  <Mic size={48} strokeWidth={1.5} />
                </motion.button>
              )}

              {/* REQUESTING */}
              {phase === 'requesting' && (
                <motion.div key="requesting"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="w-32 h-32 rounded-full flex items-center justify-center"
                  style={{ border: '3px solid #F3F4F6' }}>
                  <motion.div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-gray-600"
                    animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.85, ease: 'linear' }} />
                </motion.div>
              )}

              {/* RECORDING */}
              {phase === 'recording' && (
                <motion.button key="recording"
                  initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.25 }}
                  onClick={rec.stop}
                  className="relative w-32 h-32 rounded-full flex items-center justify-center text-white focus:outline-none active:scale-95 transition-transform"
                  style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}
                  aria-label="Stop recording">
                  <motion.span className="absolute inset-0 rounded-full pointer-events-none"
                    style={{ backgroundColor: 'rgba(239,68,68,0.3)' }}
                    animate={{ scale: [1, 1.28, 1], opacity: [0.7, 0, 0.7] }}
                    transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }} />
                  <div className="flex items-center gap-1.5 relative z-10">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.div key={i} className="w-1.5 rounded-full bg-white"
                        style={{ height: 10 }}
                        animate={{ height: ['10px', '30px', '10px'] }}
                        transition={{ repeat: Infinity, duration: 0.65, delay: i * 0.11, ease: 'easeInOut' }} />
                    ))}
                  </div>
                </motion.button>
              )}

              {/* TRANSCRIBING — amber */}
              {phase === 'transcribing' && (
                <motion.div key="transcribing"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-32 h-32 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', border: '3px solid #FCD34D' }}>
                  <motion.div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-amber-600"
                    animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }} />
                </motion.div>
              )}

              {/* UNDERSTANDING — green */}
              {phase === 'understanding' && (
                <motion.div key="understanding"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-32 h-32 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: '3px solid #86EFAC' }}>
                  <motion.div className="w-12 h-12 rounded-full border-4 border-green-400 border-t-green-600"
                    animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }} />
                </motion.div>
              )}

              {/* INTENT — green check */}
              {phase === 'intent' && (
                <motion.div key="intent-icon"
                  initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
                  className="w-32 h-32 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
                  <CheckCircle2 size={52} color="white" strokeWidth={1.5} />
                </motion.div>
              )}

              {/* ERRORS */}
              {(phase === 'micError' || phase === 'apiError') && (
                <motion.div key="error-icon"
                  initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
                  className="w-32 h-32 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)', border: '2px solid #FECACA' }}>
                  <AlertCircle size={52} color="#EF4444" strokeWidth={1.5} />
                </motion.div>
              )}

            </AnimatePresence>

            {/* Sub-label */}
            <AnimatePresence mode="wait">
              {phase === 'idle' && (
                <motion.p key="tap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-xs text-gray-400">Tap to speak</motion.p>
              )}
              {phase === 'recording' && (
                <motion.div key="timer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2">
                  <motion.span className="w-2 h-2 rounded-full bg-red-500"
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }} />
                  <span className="font-mono text-sm font-semibold text-gray-700 tabular-nums">{fmt(rec.durationMs)}</span>
                  <button onClick={rec.stop}
                    className="ml-2 px-3 py-1 rounded-lg text-xs font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}>
                    Stop
                  </button>
                </motion.div>
              )}
              {phase === 'transcribing' && (
                <motion.p key="tx-label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-sm text-amber-600 font-medium">
                  Processing {fmt(rec.durationMs)} of audio…
                </motion.p>
              )}
              {phase === 'understanding' && txResult && (
                <motion.p key="under-label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-sm text-green-700 font-medium text-center max-w-[220px]">
                  Heard: "{txResult.transcript.slice(0, 55)}{txResult.transcript.length > 55 ? '…' : ''}"
                </motion.p>
              )}
              {(phase === 'micError' || phase === 'apiError') && (
                <motion.p key="err-msg"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-xs text-center text-red-500 max-w-[260px] leading-relaxed">
                  {errorMsg}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Error reset */}
            <AnimatePresence>
              {(phase === 'micError' || phase === 'apiError') && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  onClick={handleReset}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white active:scale-95 transition-transform"
                  style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
                  <RotateCcw size={14} /> Try again
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Language chips (idle + recording) ── */}
      <AnimatePresence>
        {(phase === 'idle' || phase === 'recording') && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ delay: phase === 'idle' ? 0.1 : 0 }}
            className="flex flex-wrap justify-center gap-2 mb-7">
            {LANGS.map(({ label, hint }) => {
              const active = selectedLang === hint;
              return (
                <button key={hint}
                  onClick={() => setSelectedLang(active ? '' : hint)}
                  className="px-3 py-1.5 text-xs font-medium rounded-full transition-all active:scale-95"
                  style={{
                    backgroundColor: active ? '#22C55E' : '#F0FDF4',
                    color: active ? '#fff' : '#166534',
                    border: `1px solid ${active ? '#16A34A' : '#BBF7D0'}`,
                  }}>
                  {label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Example queries (idle) ── */}
      <AnimatePresence>
        {phase === 'idle' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-2 mb-8 w-full">
            <p className="text-xs text-gray-400 mb-1">Try saying</p>
            {EXAMPLES.map((ex) => (
              <span key={ex} className="text-xs px-4 py-2 rounded-xl text-center w-full"
                style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', color: '#6B7280' }}>
                {ex}
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Intent card ── */}
      <AnimatePresence>
        {phase === 'intent' && intent && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} className="w-full mb-6">

            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {txResult && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  style={{ backgroundColor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' }}>
                  <Languages size={11} /> {LANG_DISPLAY[txResult.language] ?? txResult.language}
                </span>
              )}
              {intent.category_slug && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                  style={{ backgroundColor: '#F9FAFB', color: '#374151', border: '1px solid #E5E7EB' }}>
                  {CAT_LABELS[intent.category_slug] ?? intent.category_slug}
                </span>
              )}
            </div>

            <div className="rounded-2xl p-4 card-shadow w-full"
              style={{ backgroundColor: '#fff', border: '1px solid #F0FDF4' }}>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-4">
                Search intent — edit if needed
              </p>
              <div className="mb-4">
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Skill</label>
                <input value={editSkill} onChange={(e) => setEditSkill(e.target.value)}
                  className="w-full text-sm font-semibold text-gray-800 pb-1.5 outline-none bg-transparent"
                  style={{ borderBottom: '1.5px solid #E5E7EB' }} placeholder="What do you want to learn?" />
              </div>
              <div className="mb-4">
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Area</label>
                <input value={editArea} onChange={(e) => setEditArea(e.target.value)}
                  className="w-full text-sm text-gray-700 pb-1.5 outline-none bg-transparent"
                  style={{ borderBottom: '1.5px solid #E5E7EB' }} placeholder="Anywhere near you" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Max price (₹)</label>
                <input value={editMaxPrice} onChange={(e) => setEditMaxPrice(e.target.value)}
                  type="number" min={0}
                  className="w-full text-sm text-gray-700 pb-1.5 outline-none bg-transparent"
                  style={{ borderBottom: '1.5px solid #E5E7EB' }} placeholder="No limit" />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-gray-600 active:scale-95 transition-transform"
                style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                <RotateCcw size={13} /> Record again
              </button>
              <button onClick={handleFindSkills}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
                <Search size={13} /> Find skills
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Searching spinner ── */}
      <AnimatePresence>
        {phase === 'searching' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 w-full mb-8">
            <div className="relative w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
              <motion.span className="absolute inset-0 rounded-full"
                style={{ border: '2px solid rgba(255,255,255,0.4)' }}
                animate={{ scale: [1, 1.6, 1.6], opacity: [0.8, 0, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeOut' }} />
              <motion.span className="absolute inset-0 rounded-full"
                style={{ border: '2px solid rgba(255,255,255,0.4)' }}
                animate={{ scale: [1, 1.6, 1.6], opacity: [0.8, 0, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: 0.5, ease: 'easeOut' }} />
              <Search size={30} color="white" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-gray-500">Searching teachers near you…</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results view ── */}
      <AnimatePresence>
        {phase === 'results' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} className="w-full">

            {/* Compact search summary bar */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-base font-bold text-gray-900">{editSkill || 'Skill search'}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {[
                    editArea && `Near ${editArea}`,
                    editMaxPrice && `≤₹${editMaxPrice}`,
                    intent?.category_slug && (CAT_LABELS[intent.category_slug] ?? intent.category_slug),
                  ].filter(Boolean).join(' · ') || 'All areas · No price limit'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleEditSearch}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>
                  Edit
                </button>
                <button onClick={handleReset}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' }}>
                  <Mic size={11} className="inline mr-1" />New
                </button>
              </div>
            </div>

            {results.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center py-16 text-center">
                <Compass size={40} className="text-gray-200 mb-4" />
                <p className="font-semibold text-gray-600 mb-1">No teachers found</p>
                <p className="text-sm text-gray-400 mb-6 max-w-xs">
                  Try a broader area or different skill. You can edit the search or record again.
                </p>
                <div className="flex gap-3">
                  <button onClick={handleEditSearch}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600"
                    style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                    Edit search
                  </button>
                  <button onClick={handleReset}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
                    Record again
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="grid gap-5">
                {results.map((s, i) => (
                  <motion.div key={s.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}>
                    <SkillTeacherCard skill={s} index={i} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Spacer ── */}
      <div className="flex-1 min-h-8" />

      {/* ── Stage Indicator ── */}
      <div className="flex flex-col items-center gap-2 pt-6">
        <div className="flex items-center">
          {STAGES.map((stage, i) => (
            <Fragment key={stage}>
              <div className="flex flex-col items-center gap-1.5">
                <motion.div className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: dotColor(i) }}
                  animate={dotPulsing(i) ? { scale: [1, 1.4, 1] } : {}}
                  transition={{ repeat: dotPulsing(i) ? Infinity : 0, duration: 0.9 }} />
                <span className={`text-[10px] font-medium ${i <= 3 ? 'text-gray-500' : 'text-gray-300'}`}>
                  {stage}
                </span>
              </div>
              {i < STAGES.length - 1 && (
                <div className="w-9 h-px mb-3.5 mx-1" style={{ backgroundColor: '#E5E7EB' }} />
              )}
            </Fragment>
          ))}
        </div>
      </div>

    </div>
  );
}
