import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

const SCOUT = 0;

describe('AgentRegistry', () => {
  async function deploy() {
    const [admin, owner, stranger] = await ethers.getSigners();
    const registry = await ethers.deployContract('AgentRegistry', [admin.address]);
    return { registry, admin, owner, stranger };
  }

  it('registers an agent and reads it back', async () => {
    const { registry, owner } = await loadFixture(deploy);
    const strategyHash = ethers.id('scout-v1');

    await expect(registry.registerAgent(SCOUT, 'The Scout', strategyHash, owner.address))
      .to.emit(registry, 'AgentRegistered')
      .withArgs(1n, SCOUT, owner.address, strategyHash);

    expect(await registry.agentCount()).to.equal(1n);
    const agent = await registry.getAgent(1);
    expect(agent.name).to.equal('The Scout');
    expect(agent.owner).to.equal(owner.address);
    expect(agent.active).to.equal(true);
  });

  it('updates strategy and active status', async () => {
    const { registry, owner } = await loadFixture(deploy);
    await registry.registerAgent(SCOUT, 'The Scout', ethers.id('v1'), owner.address);

    const next = ethers.id('v2');
    await expect(registry.updateStrategy(1, next))
      .to.emit(registry, 'StrategyUpdated')
      .withArgs(1n, next);

    await expect(registry.setActive(1, false))
      .to.emit(registry, 'AgentStatusChanged')
      .withArgs(1n, false);
    expect((await registry.getAgent(1)).active).to.equal(false);
  });

  it('rejects non-registrar callers', async () => {
    const { registry, owner, stranger } = await loadFixture(deploy);
    await expect(
      registry.connect(stranger).registerAgent(SCOUT, 'x', ethers.id('v1'), owner.address),
    ).to.be.revertedWithCustomError(registry, 'AccessControlUnauthorizedAccount');
  });

  it('reverts on unknown agent', async () => {
    const { registry } = await loadFixture(deploy);
    await expect(registry.getAgent(99)).to.be.revertedWithCustomError(registry, 'AgentNotFound');
  });
});
