import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule('Whistle', (m) => {
  const admin = m.getParameter('admin');
  const stable = m.getParameter('stable');
  const scoutMinter = m.getParameter('scoutMinter');
  const perMatchCeiling = m.getParameter('perMatchCeiling', 0n);
  const entryFee = m.getParameter('entryFee');
  const signers = m.getParameter('signers');
  const challengeWindow = m.getParameter('challengeWindow', 300n);

  const registry = m.contract('AgentRegistry', [admin]);
  const positions = m.contract('PositionManager', [admin, stable, registry, perMatchCeiling]);
  const moments = m.contract('MomentNFT', [admin, scoutMinter]);
  const fantasy = m.contract('FantasyEntry', [admin, stable, entryFee]);
  const oracle = m.contract('SettlementOracle', [admin, signers, challengeWindow]);

  return { registry, positions, moments, fantasy, oracle };
});
