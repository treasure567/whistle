import type { Address } from "viem";

import { X_LAYER_CHAIN_ID } from "./chains";

type ContractName =
  | "AgentRegistry"
  | "PositionManager"
  | "MomentNFT"
  | "FantasyEntry"
  | "SettlementOracle";

type AddressBook = Record<ContractName, Address>;

const MOCK_ADDRESSES: AddressBook = {
  AgentRegistry: "0xA9eB13e07caC9F0428B17B4D45e0d2a7e9ED4C21",
  PositionManager: "0xB17b5C4fE9c4d3a02bC8fD9F2F1c1E2bDcCe3F44",
  MomentNFT: "0xC4eEdaB52fD58afA6E5f0bC1aE2b3A48Db8bA1cE",
  FantasyEntry: "0xD30f7E1Cf3c2a40dE9B82A4dB1bCa84e4F8b3aA7",
  SettlementOracle: "0xE82dAa7c8c3E5BF1D26B6A8d4f57b4BfA8d9E6C0",
};

export const CONTRACTS: Record<number, AddressBook> = {
  [X_LAYER_CHAIN_ID]: MOCK_ADDRESSES,
};

export function getContract(chainId: number, name: ContractName): Address {
  const book = CONTRACTS[chainId];
  if (!book) throw new Error(`No address book for chainId ${chainId}`);
  return book[name];
}

export const CONTRACT_LIST: ReadonlyArray<{
  name: ContractName;
  address: Address;
  lines: number;
  description: string;
}> = [
  {
    name: "AgentRegistry",
    address: MOCK_ADDRESSES.AgentRegistry,
    lines: 80,
    description: "Agent metadata, strategy hash, owner.",
  },
  {
    name: "PositionManager",
    address: MOCK_ADDRESSES.PositionManager,
    lines: 150,
    description: "Routes capital and positions per agent per user.",
  },
  {
    name: "MomentNFT",
    address: MOCK_ADDRESSES.MomentNFT,
    lines: 90,
    description: "ERC-721 Scout mints, metadata pinned to IPFS.",
  },
  {
    name: "FantasyEntry",
    address: MOCK_ADDRESSES.FantasyEntry,
    lines: 110,
    description: "Per-tournament roster registry for Manager.",
  },
  {
    name: "SettlementOracle",
    address: MOCK_ADDRESSES.SettlementOracle,
    lines: 70,
    description: "2-of-3 multisig-signed match result poster.",
  },
];
