# Contracts

## Version
1.0.0

## Installation
Before running any script, ensure you have Node.js and pnpm installed.

```bash
pnpm install
```

## Scripts

- `clean`: Clean artifacts using Hardhat.
- `compile`: Compile smart contracts.
- `test`: Run tests for ERC20 contracts on the AURORA_TESTNET network.
- `deploy:test:aurora`: Deploy Aurora contracts on the AURORA_TESTNET network.
- `deploy:test:eggo`: Deploy Eggo contracts on the AURORA_TESTNET network.
- `format`: Format code using Biome.
- `lint`: Lint code using Biome.


## Dependencies

- Hardhat and related plugins for Ethereum development.
- `env-cmd` for managing environment variables.
- `biome` for code linting and formatting.
- `ethers` for interacting with the Ethereum blockchain.
- `axios` for HTTP requests.
- `viem` and related tools.

## Development

To compile the smart contracts, use:

```bash
pnpm compile
```

To run tests:

```bash
pnpm test
```

For deploying to the AURORA_TESTNET network

```bash
pnpm deploy:test:aurora
pnpm deploy:test:eggo
```

## Contributing

Contributions to `drag-web3` are welcome. Please ensure that your code adheres to the project's coding standards and include tests for new features or bug fixes.

## License
The project is licensed under the ISC license.
