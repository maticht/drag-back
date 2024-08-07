const { User } = require("../../../models/user");
const { addToBuffer } = require("../../../utils/clickHouse/dataBuffer");
const { decryptData } = require("../../../utils/helpers");
const { walletClient, publicClient, account } = require('./client')
const {
    BaseError,
    ContractFunctionRevertedError,
    recoverAddress,
} = require('viem')
const yup = require('yup')
const abiEggo = require('./abiEggo.json')
const abiAurora = require('./abiAurora.json')

class Web3Controller {

    async withdraw(req, res) {
        try {

            const { bodyValue } = req.body;
            console.log(bodyValue)


            const decryptedData = decryptData(bodyValue);
            console.log(decryptedData)

            const amount = 10 // тут значение нужно взять из базы
            const amountBigInt = BigInt(amount * 10 ** 18)

            const validationSchema = yup.object().shape({
                to: yup.string().required(),
                signature: yup.string().required(),
                nonce: yup.string().required(),
                messageHash: yup.string().required(),
            })
            const dataValidated = await validationSchema.validate(decryptedData)

            const paramsBalance = {
                address: process.env.ADDRESS_CONTRACT_AURORA,
                abi: abiAurora,
                functionName: 'balanceOf',
                args: [account.address],
            }

            const paramsAllowance = {
                address: process.env.ADDRESS_CONTRACT_AURORA,
                abi: abiAurora,
                functionName: 'allowance',
                args: [account.address, process.env.ADDRESS_CONTRACT_EGGO],
            }

            const paramsWithdraw = {
                address: process.env.ADDRESS_CONTRACT_EGGO,
                abi: abiEggo,
                functionName: 'withdrawByOwner',
                args: [
                    dataValidated.to,
                    amountBigInt,
                    BigInt(parseInt(dataValidated.nonce)),
                    dataValidated.signature,
                    dataValidated.messageHash,
                ],
            }

            const [balanceOf, allowance, recoveredAddress] = await Promise.all([
                publicClient.readContract(paramsBalance),
                publicClient.readContract(paramsAllowance),
                recoverAddress({
                    hash: dataValidated.messageHash,
                    signature: dataValidated.signature,
                }),
            ])

            if (recoveredAddress !== dataValidated.to) {
                throw new Error('Invalid signature')
            }

            if (balanceOf < amountBigInt) {
                throw new Error('Insufficient balance')
            }

            if (allowance < amountBigInt) {
                throw new Error('Insufficient allowance')
            }

            // simulate transaction
            await publicClient.simulateContract(paramsWithdraw)

            // send transaction
            return await walletClient.writeContract(paramsWithdraw)
        } catch (err) {
            if (err instanceof BaseError) {
                const revertError = err.walk(
                    (err) => err instanceof ContractFunctionRevertedError,
                )
                if (revertError?.reason) {
                    throw Error(revertError.reason)
                }

                if (err.shortMessage) {
                    throw Error(err.shortMessage)
                } else {
                    throw err
                }
            } else {
                throw err
            }
        }
    }


}

module.exports = new Web3Controller();
