import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { useRecorder } from '../hooks/useRecorder';
import { transcribeAudio, extractIntent } from '../lib/api/voice';
import type { ProfileIntent, ListingIntent } from '../types';

type PrefillMode = 'profile' | 'listing';
type BarStatus = 'idle' | 'recording' | 'processing' | 'done' | 'error';

interface Props {
  mode: PrefillMode;
  onFilled: (data: ProfileIntent | ListingIntent) => void;
}

const LANGS = [
  { label: 'हिन्दी', hint: 'hi' },
  { label: 'English', hint: 'en' },
  { label: 'ಕನ್ನಡ', hint: 'kn' },
  { label: 'தமிழ்', hint: 'ta' },
  { label: 'తెలుగు', hint: 'te' },
];


function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function VoicePrefillBar({ mode, onFilled }: Props) {
  const rec = useRecorder();
  const [selectedLang, setSelectedLang] = useState('');
  const [barStatus, setBarStatus] = useState<BarStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const abortRef = useRef(false);
  // Ref stays current every render — effect reads latest value without being a dep
  const selectedLangRef = useRef('');
  selectedLangRef.current = selectedLang;

  // Run pipeline when recording stops
  useEffect(() => {
    if (rec.status !== 'stopped' || !rec.audioBlob) return;
    abortRef.current = false;
    setBarStatus('processing');
    setErrorMsg('');

    (async () => {
      try {
        const tx = await transcribeAudio(rec.audioBlob!, selectedLangRef.current);
        if (abortRef.current) return;
        const intent = await extractIntent(tx.transcript, tx.language, mode);
        if (abortRef.current) return;

        onFilled(intent as ProfileIntent | ListingIntent);
        setBarStatus('done');
      } catch (err) {
        if (abortRef.current) return;
        setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
        setBarStatus('error');
      }
    })();
  }, [rec.audioBlob, rec.status]);

  function handleReset() {
    abortRef.current = true;
    rec.reset();
    setBarStatus('idle');
    setErrorMsg('');
    setTimeout(() => { abortRef.current = false; }, 100);
  }

  const isRecording = rec.status === 'recording';
  const isRequesting = rec.status === 'requesting';
  const effectiveStatus: BarStatus =
    rec.status === 'error' ? 'error' :
    isRecording ? 'recording' :
    barStatus;

  // ── Done ──
  if (effectiveStatus === 'done') {
    return (
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl mb-5"
        style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
        <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-green-800">Voice filled your details</p>
          <p className="text-xs text-green-600">Review and edit below, then submit.</p>
        </div>
        <button onClick={handleReset}
          className="text-xs font-semibold text-green-700 hover:underline flex-shrink-0">
          Redo
        </button>
      </motion.div>
    );
  }

  // ── Error ──
  if (effectiveStatus === 'error') {
    return (
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl mb-5"
        style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
        <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
        <p className="flex-1 text-xs text-red-600 leading-relaxed line-clamp-2 min-w-0">
          {rec.errorMsg ?? errorMsg}
        </p>
        <button onClick={handleReset}
          className="flex items-center gap-1 text-xs font-semibold text-red-700 flex-shrink-0">
          <RotateCcw size={11} /> Retry
        </button>
      </motion.div>
    );
  }

  // ── Processing ──
  if (effectiveStatus === 'processing') {
    return (
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl mb-5"
        style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}>
        <motion.div
          className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-amber-600 flex-shrink-0"
          animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.85, ease: 'linear' }} />
        <p className="text-sm font-medium text-amber-700">Processing your voice…</p>
      </motion.div>
    );
  }

  // ── Recording ──
  if (effectiveStatus === 'recording') {
    return (
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl mb-5"
        style={{ backgroundColor: '#FFF1F2', border: '1px solid #FECDD3' }}>
        <motion.span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0"
          animate={{ opacity: [1, 0.25, 1] }} transition={{ repeat: Infinity, duration: 0.9 }} />
        <span className="font-mono text-sm font-semibold text-red-700 tabular-nums flex-1">
          {fmt(rec.durationMs)}
        </span>
        <button onClick={() => rec.stop()}
          className="px-3 py-1 rounded-lg text-xs font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}>
          Stop
        </button>
      </motion.div>
    );
  }

  // ── Idle ──
  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      className="w-full mb-5">
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
        <Mic size={15} className="text-green-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-green-800">
            {mode === 'profile' ? 'Fill with your voice' : 'Describe your skill'}
          </p>
          <p className="text-xs text-green-600 leading-snug">
            {mode === 'profile'
              ? 'Say your name, where you are and what you do'
              : 'Say title, price and what learners will get'}
          </p>
        </div>
        <motion.button
          onClick={() => rec.start()}
          disabled={isRequesting}
          whileTap={{ scale: 0.88 }}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
          aria-label="Start recording">
          {isRequesting
            ? <motion.div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent"
                animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }} />
            : <Mic size={17} />}
        </motion.button>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2 px-1">
        {LANGS.map(({ label, hint }) => {
          const active = selectedLang === hint;
          return (
            <button key={hint}
              onClick={() => setSelectedLang(active ? '' : hint)}
              className="px-2.5 py-1 text-[11px] font-medium rounded-full transition-all"
              style={{
                backgroundColor: active ? '#22C55E' : '#F0FDF4',
                color: active ? '#fff' : '#166534',
                border: `1px solid ${active ? '#16A34A' : '#BBF7D0'}`,
              }}>
              {label}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
