const { createWalletClient, http, createPublicClient } = require('viem')
const { privateKeyToAccount } = require('viem/accounts')
const { auroraTestnet } = require('viem/chains')

const account = privateKeyToAccount(process.env.PRIVATE_KEY_OWNER)

module.exports.walletClient = createWalletClient({
  account,
  chain: auroraTestnet,
  transport: http(),
})

module.exports.publicClient = createPublicClient({
  chain: auroraTestnet,
  transport: http(),
  account,
})

module.exports.account = account
