import { ethers, run } from 'hardhat'

async function main() {
  const [deployer] = await ethers.getSigners()

  const Token = await ethers.getContractFactory('Aurora')
  const constructorArguments: [string] = [deployer.address]

  console.log('Deploying:', deployer.address)
  const token = await Token.deploy(...constructorArguments)

  const contractAddress = await token.getAddress()
  console.log('Deployed success:', contractAddress)

  console.log('Verifying:', contractAddress)
  await run('verify:verify', {
    address: contractAddress,
    constructorArguments,
  })
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
