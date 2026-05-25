import {
  getContract,
  type Abi,
  type Address,
  type GetContractReturnType,
  type PublicClient,
  type WalletClient,
} from 'viem';
import {
  agentRegistryAbi,
  positionManagerAbi,
  momentNftAbi,
  fantasyEntryAbi,
  settlementOracleAbi,
} from './abis/index.js';

export type WhistleAddresses = {
  agentRegistry: Address;
  positionManager: Address;
  momentNft: Address;
  fantasyEntry: Address;
  settlementOracle: Address;
};

type WriteClients = { public: PublicClient; wallet: WalletClient };

type ReadHandle<abi extends Abi> = GetContractReturnType<abi, PublicClient>;
type WriteHandle<abi extends Abi> = GetContractReturnType<abi, WriteClients>;

export type WhistleReadContracts = {
  agentRegistry: ReadHandle<typeof agentRegistryAbi>;
  positionManager: ReadHandle<typeof positionManagerAbi>;
  momentNft: ReadHandle<typeof momentNftAbi>;
  fantasyEntry: ReadHandle<typeof fantasyEntryAbi>;
  settlementOracle: ReadHandle<typeof settlementOracleAbi>;
};

export type WhistleWriteContracts = {
  agentRegistry: WriteHandle<typeof agentRegistryAbi>;
  positionManager: WriteHandle<typeof positionManagerAbi>;
  momentNft: WriteHandle<typeof momentNftAbi>;
  fantasyEntry: WriteHandle<typeof fantasyEntryAbi>;
  settlementOracle: WriteHandle<typeof settlementOracleAbi>;
};

export function getReadContracts(
  addresses: WhistleAddresses,
  client: PublicClient,
): WhistleReadContracts {
  return {
    agentRegistry: getContract({ address: addresses.agentRegistry, abi: agentRegistryAbi, client }),
    positionManager: getContract({
      address: addresses.positionManager,
      abi: positionManagerAbi,
      client,
    }),
    momentNft: getContract({ address: addresses.momentNft, abi: momentNftAbi, client }),
    fantasyEntry: getContract({ address: addresses.fantasyEntry, abi: fantasyEntryAbi, client }),
    settlementOracle: getContract({
      address: addresses.settlementOracle,
      abi: settlementOracleAbi,
      client,
    }),
  };
}

export function getWriteContracts(
  addresses: WhistleAddresses,
  clients: WriteClients,
): WhistleWriteContracts {
  return {
    agentRegistry: getContract({
      address: addresses.agentRegistry,
      abi: agentRegistryAbi,
      client: clients,
    }),
    positionManager: getContract({
      address: addresses.positionManager,
      abi: positionManagerAbi,
      client: clients,
    }),
    momentNft: getContract({ address: addresses.momentNft, abi: momentNftAbi, client: clients }),
    fantasyEntry: getContract({
      address: addresses.fantasyEntry,
      abi: fantasyEntryAbi,
      client: clients,
    }),
    settlementOracle: getContract({
      address: addresses.settlementOracle,
      abi: settlementOracleAbi,
      client: clients,
    }),
  };
}
