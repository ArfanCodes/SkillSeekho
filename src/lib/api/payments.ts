import { supabase } from '../supabase';
import type { Wallet, Transaction } from '../../types';

// ── Fetch wallet for a user ───────────────────
// The migration trigger guarantees a wallet exists for every profile.

export async function getWallet(userId: string): Promise<Wallet> {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) throw new Error(error.message);
  return data as Wallet;
}

// ── Fetch all transactions for a wallet ───────

export async function getTransactions(walletId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('wallet_id', walletId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Transaction[];
}

// ── Internal: write a transaction via the secure RPC ──
// The transactions table has no client INSERT policy. All wallet writes go
// through wallet_transact() (SECURITY DEFINER), which resolves the caller's own
// wallet via auth.uid(), enforces sufficient balance on debit, and inserts the
// row + updates the balance atomically. `walletId` is accepted for call-site
// readability but the RPC always uses the authenticated user's wallet.

async function walletTransact(
  type: 'credit' | 'debit',
  amountPaise: number,
  label: string,
  bookingId?: string,
  referenceId?: string,
): Promise<Transaction> {
  const { data, error } = await supabase.rpc('wallet_transact', {
    p_type:         type,
    p_amount:       amountPaise,
    p_label:        label,
    p_booking_id:   bookingId   ?? null,
    p_reference_id: referenceId ?? null,
  });
  if (error) throw new Error(error.message);
  return data as Transaction;
}

export async function recordDebit(
  amountPaise: number,
  label: string,
  opts?: { bookingId?: string; referenceId?: string },
): Promise<Transaction> {
  return walletTransact('debit', amountPaise, label, opts?.bookingId, opts?.referenceId);
}

export async function recordCredit(
  amountPaise: number,
  label: string,
  opts?: { bookingId?: string; referenceId?: string },
): Promise<Transaction> {
  return walletTransact('credit', amountPaise, label, opts?.bookingId, opts?.referenceId);
}
