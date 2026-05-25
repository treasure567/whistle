import type { Address } from "viem";

import { X_LAYER_CHAIN_ID } from "./chains";

type ContractName =
  | "AgentRegistry"
  | "PositionManager"
  | "MomentNFT"
  | "FantasyEntry"
  | "SettlementOracle";

type AddressBook = Record<ContractName, Address>;

const X_LAYER_TESTNET_ADDRESSES: AddressBook = {
  AgentRegistry: "0x777bBFafAD29cD92575de91FF8CCA59e85729b76",
  PositionManager: "0x91bed7A3ce8940430646BD8cC4AB842a2A470B22",
  MomentNFT: "0x5c2C8476ff37010f0A258D428490152EA05F0cC5",
  FantasyEntry: "0xCf5959D698D813f1d82fa27eA9Cdd9911253d67C",
  SettlementOracle: "0x7Eb2135760B63d6f58dC33344bcd37DaF75936C4",
};

export const CONTRACTS: Record<number, AddressBook> = {
  [X_LAYER_CHAIN_ID]: X_LAYER_TESTNET_ADDRESSES,
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
