import { useCallback, useEffect, useRef, useState } from 'react';

export type RecorderStatus = 'idle' | 'requesting' | 'recording' | 'stopped' | 'error';

export interface RecorderState {
  status: RecorderStatus;
  audioBlob: Blob | null;
  durationMs: number;
  errorMsg: string | null;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
}

const MIME_PRIORITY = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/ogg',
  'audio/mp4',
];

function pickMime(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  return MIME_PRIORITY.find((m) => MediaRecorder.isTypeSupported(m)) ?? '';
}

export function useRecorder(): RecorderState {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mrRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const mimeRef = useRef('');
  const abortRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const releaseStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clearTimer();
    if (mrRef.current && mrRef.current.state === 'recording') {
      mrRef.current.stop();
    }
  }, [clearTimer]);

  const reset = useCallback(() => {
    abortRef.current = true;
    clearTimer();
    if (mrRef.current && mrRef.current.state === 'recording') {
      mrRef.current.stop();
    }
    releaseStream();
    mrRef.current = null;
    chunksRef.current = [];
    setStatus('idle');
    setAudioBlob(null);
    setDurationMs(0);
    setErrorMsg(null);
    // Let any in-flight onstop fire before clearing the abort flag
    setTimeout(() => { abortRef.current = false; }, 100);
  }, [clearTimer, releaseStream]);

  const start = useCallback(async () => {
    abortRef.current = false;
    clearTimer();
    if (mrRef.current && mrRef.current.state === 'recording') {
      mrRef.current.stop();
    }
    releaseStream();
    mrRef.current = null;
    chunksRef.current = [];
    setAudioBlob(null);
    setDurationMs(0);
    setErrorMsg(null);
    setStatus('requesting');

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMsg('Your browser does not support audio recording. Please try Chrome or Firefox.');
      setStatus('error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (abortRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;

      const mime = pickMime();
      mimeRef.current = mime;

      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      mrRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        if (abortRef.current) return;
        clearTimer();
        const finalDuration = Date.now() - startTimeRef.current;
        const blob = new Blob(chunksRef.current, { type: mimeRef.current || 'audio/webm' });
        setAudioBlob(blob);
        setDurationMs(finalDuration);
        setStatus('stopped');
        releaseStream();
      };

      mr.onerror = () => {
        if (abortRef.current) return;
        clearTimer();
        releaseStream();
        setErrorMsg('Recording failed unexpectedly. Please try again.');
        setStatus('error');
      };

      startTimeRef.current = Date.now();
      mr.start(200);
      setStatus('recording');

      timerRef.current = setInterval(() => {
        setDurationMs(Date.now() - startTimeRef.current);
      }, 100);

    } catch (err) {
      releaseStream();
      if (abortRef.current) return;
      const name = (err as DOMException)?.name;
      const msg =
        name === 'NotAllowedError' || name === 'PermissionDeniedError'
          ? 'Microphone access was denied. Allow microphone in your browser settings and try again.'
          : name === 'NotFoundError' || name === 'DevicesNotFoundError'
            ? 'No microphone found. Please connect a microphone and try again.'
            : 'Could not start recording. Check your microphone and try again.';
      setErrorMsg(msg);
      setStatus('error');
    }
  }, [clearTimer, releaseStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current = true;
      clearTimer();
      releaseStream();
    };
  }, [clearTimer, releaseStream]);

  return { status, audioBlob, durationMs, errorMsg, start, stop, reset };
}
