import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, X, Loader2 } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';

/**
 * Asks the user for live location on entry. Shows until permission is granted
 * (or dismissed for the session). The "Enable" button is a user gesture, which
 * reliably triggers the browser's native geolocation prompt.
 */
export default function LocationPrompt() {
  const geo = useGeolocation();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('geo-prompt-dismissed') === '1',
  );

  // Close automatically once we have a live fix.
  useEffect(() => {
    if (geo.status === 'granted') setDismissed(true);
  }, [geo.status]);

  const close = () => {
    sessionStorage.setItem('geo-prompt-dismissed', '1');
    setDismissed(true);
  };

  const show = !dismissed && geo.permission !== 'granted' && geo.status !== 'granted';
  const blocked = geo.permission === 'denied' || geo.status === 'denied';
  const locating = geo.status === 'locating';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={close}>
          <motion.div
            initial={{ y: '100%', opacity: 0.6 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0.6 }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 text-center relative">
            <button onClick={close} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500" aria-label="Close">
              <X size={18} />
            </button>

            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
              <MapPin size={30} color="white" strokeWidth={2.2} />
            </div>

            <h2 className="text-xl font-black text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Find teachers near you
            </h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              {blocked
                ? "Location is blocked. Enable it in your browser's site settings (tap the 🔒 in the address bar) to pinpoint teachers around you."
                : 'SkillSeekho uses your live location to pinpoint teachers nearby and sort them by real distance. On a phone this uses GPS for the most accurate result.'}
            </p>

            {!blocked && (
              <button
                onClick={geo.locate}
                disabled={locating}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white mb-2 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
                {locating ? <><Loader2 size={16} className="animate-spin" /> Locating…</> : <><Navigation size={16} /> Enable live location</>}
              </button>
            )}

            <button onClick={close} className="w-full py-2.5 text-sm font-medium text-gray-400 hover:text-gray-600">
              {blocked ? 'Continue without location' : 'Not now'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
