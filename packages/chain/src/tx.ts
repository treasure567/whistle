import type { Hash, PublicClient, TransactionReceipt } from 'viem';

export function confirm(
  publicClient: PublicClient,
  hash: Hash,
  confirmations = 1,
): Promise<TransactionReceipt> {
  return publicClient.waitForTransactionReceipt({ hash, confirmations });
}
