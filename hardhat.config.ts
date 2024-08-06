import '@nomicfoundation/hardhat-toolbox'
import { HardhatUserConfig } from 'hardhat/config'

import { networks } from './utils/network'
import '@openzeppelin/hardhat-upgrades'
import '@nomicfoundation/hardhat-chai-matchers'
import '@nomicfoundation/hardhat-ethers'
import '@nomicfoundation/hardhat-verify'

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.20',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    [process.env.ENV as string]: {
      url: process.env.NETWORK_RPC,
      chainId: Number(process.env.CHAIN_ID),
      accounts: [process.env.PRIVATE_KEY_DEPLOY as string],
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
  },
  etherscan: {
    apiKey: {
      // ethereum
      mainnet: networks['1'].apiKey,
      goerli: networks['5'].apiKey,
      sepolia: networks['11155111'].apiKey,

      // bsc
      bsc: networks['56'].apiKey,
      bscTestnet: networks['97'].apiKey,

      auroraTestnet: networks['1313161555'].apiKey,
      // aurora: networks[''].apiKey,

      // polygon
      polygon: networks['137'].apiKey,
      polygonMumbai: networks['80001'].apiKey,
    },
  },
  defender: {
    apiKey: (process.env.DEFENDER_TEAM_API_KEY as string) || 'H',
    apiSecret: (process.env.DEFENDER_TEAM_API_SECRET_KEY as string) || 'H',
  },
}

export default config
