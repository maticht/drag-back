import { ethers, run } from 'hardhat'

async function main() {
  const [deployer] = await ethers.getSigners()

  const Token = await ethers.getContractFactory('EggoQuest')
  const constructorArguments: [string, string] = [
    deployer.address,
    process.env.AURORA_TOKEN as string,
  ]

  console.log('Deploying:', deployer.address)
  const token = await Token.deploy(...constructorArguments)

  const contractAddress = await token.getAddress()
  console.log('Deployed success:', contractAddress)

  console.log('Verifying:', contractAddress)

  await new Promise((resolve) => {
    setTimeout(async () => {
      await run('verify:verify', {
        address: contractAddress,
        constructorArguments,
      })
      resolve(true)
    }, 10000) // wait 10 seconds
  })
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
