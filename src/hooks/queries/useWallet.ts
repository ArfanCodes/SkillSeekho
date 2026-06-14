import { useQuery } from '@tanstack/react-query';
import { getWallet, getTransactions } from '../../lib/api/payments';

export function useWallet(userId: string | undefined) {
  return useQuery({
    queryKey: ['wallet', userId],
    queryFn:  () => getWallet(userId as string),
    enabled:  !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useTransactions(walletId: string | undefined) {
  return useQuery({
    queryKey: ['transactions', walletId],
    queryFn:  () => getTransactions(walletId as string),
    enabled:  !!walletId,
    staleTime: 1000 * 60,
  });
}
