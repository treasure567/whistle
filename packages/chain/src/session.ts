import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import type { Address, Hex } from 'viem';

export type SessionKey = {
  privateKey: Hex;
  address: Address;
};

export function createSessionKey(): SessionKey {
  const privateKey = generatePrivateKey();
  return { privateKey, address: privateKeyToAccount(privateKey).address };
}
