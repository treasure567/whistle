import type { Address } from "viem";

import { X_LAYER_CHAIN_ID, X_LAYER_USDT_ADDRESS } from "./chains";
import type { AgentSlug } from "@/types";

type ContractName =
  | "AgentRegistry"
  | "PositionManager"
  | "MomentNFT"
  | "FantasyEntry"
  | "SettlementOracle";

type AddressBook = Record<ContractName, Address>;

const X_LAYER_TESTNET_ADDRESSES: AddressBook = {
  AgentRegistry: (process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS ??
    "0x777bBFafAD29cD92575de91FF8CCA59e85729b76") as Address,
  PositionManager: (process.env.NEXT_PUBLIC_POSITION_MANAGER_ADDRESS ??
    "0x91bed7A3ce8940430646BD8cC4AB842a2A470B22") as Address,
  MomentNFT: (process.env.NEXT_PUBLIC_MOMENT_NFT_ADDRESS ??
    "0x5c2C8476ff37010f0A258D428490152EA05F0cC5") as Address,
  FantasyEntry: (process.env.NEXT_PUBLIC_FANTASY_ENTRY_ADDRESS ??
    "0xCf5959D698D813f1d82fa27eA9Cdd9911253d67C") as Address,
  SettlementOracle: (process.env.NEXT_PUBLIC_SETTLEMENT_ORACLE_ADDRESS ??
    "0x7Eb2135760B63d6f58dC33344bcd37DaF75936C4") as Address,
};

export const CONTRACTS: Record<number, AddressBook> = {
  [X_LAYER_CHAIN_ID]: X_LAYER_TESTNET_ADDRESSES,
};

export function getContract(chainId: number, name: ContractName): Address {
  const book = CONTRACTS[chainId];
  if (!book) throw new Error(`No address book for chainId ${chainId}`);
  return book[name];
}

/// Onchain agent ids assigned at registration time. Agents are registered in
/// kind order (Scout, Bookie, Manager) so ids start at 1 and follow that order.
export const AGENT_ONCHAIN_ID: Record<AgentSlug, bigint> = {
  scout: 1n,
  bookie: 2n,
  manager: 3n,
};

/// MockERC20 test stablecoin standing in for USDT on testnet. 18 decimals.
export const STABLE_TOKEN_ADDRESS = X_LAYER_USDT_ADDRESS as Address;
export const STABLE_DECIMALS = 18;

export const CONTRACT_LIST: ReadonlyArray<{
  name: ContractName;
  address: Address;
  lines: number;
  description: string;
}> = [
  {
    name: "AgentRegistry",
    address: X_LAYER_TESTNET_ADDRESSES.AgentRegistry,
    lines: 80,
    description: "Stores who each helper is and how they behave.",
  },
  {
    name: "PositionManager",
    address: X_LAYER_TESTNET_ADDRESSES.PositionManager,
    lines: 150,
    description: "Holds your money and tracks what each helper spends.",
  },
  {
    name: "MomentNFT",
    address: X_LAYER_TESTNET_ADDRESSES.MomentNFT,
    lines: 90,
    description: "Where Emma saves match moments for you to keep.",
  },
  {
    name: "FantasyEntry",
    address: X_LAYER_TESTNET_ADDRESSES.FantasyEntry,
    lines: 110,
    description: "Where Tom registers player picks for each match.",
  },
  {
    name: "SettlementOracle",
    address: X_LAYER_TESTNET_ADDRESSES.SettlementOracle,
    lines: 70,
    description: "Posts official match results so bets can settle fairly.",
  },
];
