import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

const SCOUT = 0;
const CEILING = ethers.parseUnits('1000', 18);

describe('PositionManager', () => {
  async function deploy() {
    const [admin, agent, user] = await ethers.getSigners();

    const stable = await ethers.deployContract('MockERC20');
    const registry = await ethers.deployContract('AgentRegistry', [admin.address]);
    await registry.registerAgent(SCOUT, 'The Bookie', ethers.id('v1'), admin.address);

    const manager = await ethers.deployContract('PositionManager', [
      admin.address,
      await stable.getAddress(),
      await registry.getAddress(),
      CEILING,
    ]);
    await manager.grantRole(await manager.AGENT_ROLE(), agent.address);

    await stable.mint(user.address, ethers.parseUnits('5000', 18));
    await stable.connect(user).approve(await manager.getAddress(), ethers.MaxUint256);
    await stable.mint(await manager.getAddress(), ethers.parseUnits('5000', 18));

    return { manager, stable, registry, admin, agent, user };
  }

  it('allocates and withdraws capital', async () => {
    const { manager, agent, user } = await loadFixture(deploy);
    const amount = ethers.parseUnits('500', 18);

    await expect(manager.connect(user).allocate(1, amount))
      .to.emit(manager, 'CapitalAllocated')
      .withArgs(user.address, 1n, amount);
    expect(await manager.allocations(user.address, 1)).to.equal(amount);

    await manager.connect(user).withdraw(1, amount);
    expect(await manager.allocations(user.address, 1)).to.equal(0n);
  });

  it('opens and settles a winning position', async () => {
    const { manager, agent, user } = await loadFixture(deploy);
    await manager.connect(user).allocate(1, ethers.parseUnits('500', 18));

    const stake = ethers.parseUnits('100', 18);
    await expect(manager.connect(agent).openPosition(user.address, 1, 7, stake))
      .to.emit(manager, 'PositionOpened')
      .withArgs(1n, 1n, user.address, 7n, stake);

    const payout = ethers.parseUnits('180', 18);
    await expect(manager.connect(agent).settlePosition(1, true, payout))
      .to.emit(manager, 'PositionSettled')
      .withArgs(1n, 1, payout);

    expect(await manager.allocations(user.address, 1)).to.equal(
      ethers.parseUnits('580', 18),
    );
  });

  it('enforces the per-match ceiling', async () => {
    const { manager, agent, user } = await loadFixture(deploy);
    await manager.connect(user).allocate(1, ethers.parseUnits('5000', 18));
    await expect(
      manager.connect(agent).openPosition(user.address, 1, 7, ethers.parseUnits('1001', 18)),
    ).to.be.revertedWithCustomError(manager, 'CeilingExceeded');
  });

  it('rejects opening beyond the allocation', async () => {
    const { manager, agent, user } = await loadFixture(deploy);
    await manager.connect(user).allocate(1, ethers.parseUnits('50', 18));
    await expect(
      manager.connect(agent).openPosition(user.address, 1, 7, ethers.parseUnits('100', 18)),
    ).to.be.revertedWithCustomError(manager, 'InsufficientAllocation');
  });

  it('rejects openPosition from a non-agent', async () => {
    const { manager, user } = await loadFixture(deploy);
    await manager.connect(user).allocate(1, ethers.parseUnits('100', 18));
    await expect(
      manager.connect(user).openPosition(user.address, 1, 7, ethers.parseUnits('10', 18)),
    ).to.be.revertedWithCustomError(manager, 'AccessControlUnauthorizedAccount');
  });
});
