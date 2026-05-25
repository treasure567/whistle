# `@whistle/contracts`

The onchain primitives for the whistle agent stable, deployed on X Layer.
Solidity 0.8.24, OpenZeppelin AccessControl, Hardhat tested.

## Contracts

| Contract | Responsibility |
|---|---|
| `AgentRegistry` | Agent metadata, strategy hash, and owner for Scout, Bookie, and Manager. |
| `PositionManager` | Routes user capital and positions per agent, bounded by a per-match ceiling. |
| `MomentNFT` | ERC-721 commemorative moments minted by the Scout, metadata pinned to IPFS. |
| `FantasyEntry` | Per-tournament roster registry for the Manager. Players are nation plus jersey only, never names. |
| `SettlementOracle` | 2-of-3 multisig match-result poster with a challenge window. |

`contracts/mocks/MockERC20.sol` is a test-only stand-in for the USDT
stablecoin and is never deployed to production.

## Networks

| Network | Chain id |
|---|---|
| X Layer testnet | 195 |
| X Layer mainnet | 196 |

## Commands

```
pnpm install
pnpm compile
pnpm test
pnpm coverage
pnpm deploy:testnet   # needs DEPLOYER_PRIVATE_KEY and Ignition params
pnpm deploy:mainnet
```

Copy `.env.example` to `.env` before deploying. Deployment parameters
(admin, stable token, signers, fees) are supplied to the Ignition module
at deploy time.

## Deployed addresses

| Contract | Testnet | Mainnet |
|---|---|---|
| AgentRegistry | tbd | tbd |
| PositionManager | tbd | tbd |
| MomentNFT | tbd | tbd |
| FantasyEntry | tbd | tbd |
| SettlementOracle | tbd | tbd |
