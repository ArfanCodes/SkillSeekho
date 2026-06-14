// ─────────────────────────────────────────────
// Razorpay Checkout (client-only trial integration)
//
// Trial mode: we open Checkout with just the public Key ID — no server-side
// order creation and no signature verification. The success handler hands us a
// razorpay_payment_id which we trust. This is fine for a test/demo but a user
// could fake success in devtools; production needs an edge function that
// creates an order and verifies the signature with the Key Secret.
// ─────────────────────────────────────────────

const KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;
const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

interface RazorpayInstance {
  open: () => void;
  on: (event: string, cb: (resp: unknown) => void) => void;
}

interface RazorpayConstructor {
  new (options: Record<string, unknown>): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

// Inject checkout.js once; resolves true when available.
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface CheckoutParams {
  /** Amount in whole rupees (we convert to paise for Razorpay). */
  amountRupees: number;
  name: string;          // merchant/title shown in modal header
  description: string;   // line under the title
  prefill?: { name?: string; email?: string; contact?: string };
}

export interface CheckoutResult {
  paymentId: string;
}

export const isRazorpayConfigured = () => !!KEY_ID;

/**
 * Opens Razorpay Checkout for the given amount.
 * Resolves with the payment id on success, or `null` if the user dismisses
 * the modal. Rejects only if the SDK fails to load or isn't configured.
 */
export async function openCheckout(params: CheckoutParams): Promise<CheckoutResult | null> {
  if (!KEY_ID) {
    throw new Error('Razorpay is not configured (VITE_RAZORPAY_KEY_ID missing).');
  }

  const ok = await loadRazorpayScript();
  if (!ok || !window.Razorpay) {
    throw new Error('Could not load Razorpay. Check your connection and try again.');
  }

  return new Promise<CheckoutResult | null>((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key:         KEY_ID,
      amount:      Math.round(params.amountRupees * 100), // paise
      currency:    'INR',
      name:        params.name,
      description: params.description,
      prefill:     params.prefill ?? {},
      theme:       { color: '#16A34A' },
      handler: (resp: unknown) => {
        const r = resp as { razorpay_payment_id?: string };
        if (r?.razorpay_payment_id) {
          resolve({ paymentId: r.razorpay_payment_id });
        } else {
          reject(new Error('Payment did not return an id.'));
        }
      },
      modal: {
        ondismiss: () => resolve(null), // user closed the sheet without paying
      },
    });

    rzp.on('payment.failed', (resp: unknown) => {
      const r = resp as { error?: { description?: string } };
      reject(new Error(r?.error?.description ?? 'Payment failed.'));
    });

    rzp.open();
  });
}
