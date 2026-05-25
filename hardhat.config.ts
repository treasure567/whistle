import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import * as dotenv from 'dotenv';

dotenv.config();

const deployerKey = process.env.DEPLOYER_PRIVATE_KEY;
const accounts = deployerKey ? [deployerKey] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: 'paris',
    },
  },
  networks: {
    xlayerTestnet: {
      url: process.env.XLAYER_TESTNET_RPC_URL ?? 'https://testrpc.xlayer.tech',
      chainId: 195,
      accounts,
    },
    xlayer: {
      url: process.env.XLAYER_RPC_URL ?? 'https://rpc.xlayer.tech',
      chainId: 196,
      accounts,
    },
  },
  etherscan: {
    apiKey: { xlayer: process.env.OKLINK_API_KEY ?? '' },
    customChains: [
      {
        network: 'xlayer',
        chainId: 196,
        urls: {
          apiURL: 'https://www.oklink.com/api/v5/explorer/contract/verify-source-code-plugin/XLAYER',
          browserURL: 'https://www.oklink.com/xlayer',
        },
      },
    ],
  },
};

export default config;
