import { expect } from 'chai'
import hre, { ethers } from 'hardhat'
import { describe, it } from 'mocha'

const FIXTURE: any = {
  AuroraToken: null,
  EggoQuestToken: null,
  deployer: null,
  user: null,
}

const getSignatureAndHash = async (nonce: BigInt) => {
  const message = `Let's verify the signature #${Number(nonce)} of this message!`
  const signature = await FIXTURE.user.signMessage(message)
  const messageHash = ethers.hashMessage(message)

  return {
    message,
    signature,
    messageHash,
  }
}

describe('All Flow Test', function () {
  const values = {
    initialSupply: 100,
    decimals: 18,
    mint: BigInt(100 * 10 ** 18),
    withdrawAmount: BigInt(10 * 10 ** 18),
  }

  this.beforeAll(async () => {
    const [deployer, user] = await hre.ethers.getSigners()

    FIXTURE.deployer = deployer
    FIXTURE.user = user
    FIXTURE.AuroraToken = await ethers.deployContract('Aurora', [
      deployer.address,
    ])

    const addressAuroraToken = await FIXTURE.AuroraToken.getAddress()
    FIXTURE.EggoQuestToken = await ethers.deployContract('EggoQuest', [
      deployer.address,
      addressAuroraToken,
    ])
  })

  describe('AuroraToken', () => {
    it('should mint tokens and verify balance', async () => {
      expect(
        await FIXTURE.AuroraToken.connect(FIXTURE.deployer).decimals(),
      ).to.equal(values.decimals)

      expect(
        await FIXTURE.AuroraToken.balanceOf(FIXTURE.deployer.address),
      ).to.equal(0)
      await FIXTURE.AuroraToken.connect(FIXTURE.deployer).mint(
        FIXTURE.deployer.address,
        values.mint,
      )
      expect(
        await FIXTURE.AuroraToken.balanceOf(FIXTURE.deployer.address),
      ).to.equal(values.mint)

      const addressEggoQuestToken = await FIXTURE.EggoQuestToken.getAddress()
      // approve one time
      await FIXTURE.AuroraToken.connect(FIXTURE.deployer).approve(
        addressEggoQuestToken,
        ethers.MaxUint256,
      )
    })
  })

  describe('EggoQuest', () => {
    it('should allow withdrawal with a valid signature', async function () {
      const nonce = await FIXTURE.EggoQuestToken.nonces(FIXTURE.user.address)
      const { signature, messageHash } = await getSignatureAndHash(nonce)

      // todo
      await FIXTURE.EggoQuestToken.connect(FIXTURE.deployer).withdrawByOwner(
        FIXTURE.user.address,
        values.withdrawAmount,
        nonce,
        signature,
        messageHash,
      )

      const [userBalance, deployerBalance] = await Promise.all([
        await FIXTURE.AuroraToken.balanceOf(FIXTURE.user.address),
        await FIXTURE.AuroraToken.balanceOf(FIXTURE.deployer.address),
      ])

      expect(userBalance).to.equal(values.withdrawAmount)
      expect(deployerBalance).to.equal(values.mint - values.withdrawAmount)
    })

    it('should fail for an invalid nonce', async function () {
      const nonce = await FIXTURE.EggoQuestToken.nonces(FIXTURE.user.address)
      const { signature, messageHash } = await getSignatureAndHash(nonce)

      await expect(
        FIXTURE.EggoQuestToken.connect(FIXTURE.deployer).withdrawByOwner(
          FIXTURE.user.address,
          values.withdrawAmount,
          BigInt(0),
          signature,
          messageHash,
        ),
      ).to.be.revertedWith('Invalid nonce')
    })

    it('should fail for an invalid address', async function () {
      const nonce = await FIXTURE.EggoQuestToken.nonces(FIXTURE.user.address)
      const { signature, messageHash } = await getSignatureAndHash(nonce)

      await expect(
        FIXTURE.EggoQuestToken.connect(FIXTURE.deployer).withdrawByOwner(
          ethers.ZeroAddress,
          values.withdrawAmount,
          nonce,
          signature,
          messageHash,
        ),
      ).to.be.revertedWith('Invalid address')
    })

    it('should fail for an invalid signature', async function () {
      const nonce = await FIXTURE.EggoQuestToken.nonces(FIXTURE.user.address)
      const { signature } = await getSignatureAndHash(nonce)

      await expect(
        FIXTURE.EggoQuestToken.connect(FIXTURE.deployer).withdrawByOwner(
          FIXTURE.user.address,
          values.withdrawAmount,
          nonce,
          signature,
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        ),
      ).to.be.revertedWith('Invalid signature')
    })

    it('should fail for withdrawal with an invalid payer', async function () {
      const nonce = await FIXTURE.EggoQuestToken.nonces(FIXTURE.user.address)
      const { signature, messageHash } = await getSignatureAndHash(nonce)

      await expect(
        FIXTURE.EggoQuestToken.connect(FIXTURE.user).withdrawByOwner(
          FIXTURE.user.address,
          values.withdrawAmount,
          nonce,
          signature,
          messageHash,
        ),
      ).to.be.reverted
    })
  })
})
