import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

const AGGRESSIVE = 0;
const ENTRY_FEE = ethers.parseUnits('10', 18);

function roster(jerseyStart: number) {
  const nations = ['ARG', 'BRA', 'FRA'];
  return Array.from({ length: 11 }, (_, i) => ({
    nation: ethers.hexlify(ethers.toUtf8Bytes(nations[i % 3])),
    jersey: jerseyStart + i,
  }));
}

describe('FantasyEntry', () => {
  async function deploy() {
    const [admin, alice, bob] = await ethers.getSigners();
    const stable = await ethers.deployContract('MockERC20');
    const fantasy = await ethers.deployContract('FantasyEntry', [
      admin.address,
      await stable.getAddress(),
      ENTRY_FEE,
    ]);

    for (const who of [alice, bob]) {
      await stable.mint(who.address, ethers.parseUnits('100', 18));
      await stable.connect(who).approve(await fantasy.getAddress(), ethers.MaxUint256);
    }
    return { fantasy, stable, admin, alice, bob };
  }

  it('creates an entry and collects the fee into the prize pool', async () => {
    const { fantasy, alice } = await loadFixture(deploy);
    await expect(fantasy.connect(alice).createEntry(AGGRESSIVE, roster(1)))
      .to.emit(fantasy, 'EntryCreated')
      .withArgs(1n, alice.address, AGGRESSIVE);

    expect(await fantasy.prizePool()).to.equal(ENTRY_FEE);
    const stored = await fantasy.getRoster(1);
    expect(stored.length).to.equal(11);
    expect(stored[0].jersey).to.equal(1n);
  });

  it('rejects a roster that is not eleven players', async () => {
    const { fantasy, alice } = await loadFixture(deploy);
    await expect(
      fantasy.connect(alice).createEntry(AGGRESSIVE, roster(1).slice(0, 10)),
    ).to.be.revertedWithCustomError(fantasy, 'InvalidRoster');
  });

  it('lets only the owner update its roster', async () => {
    const { fantasy, alice, bob } = await loadFixture(deploy);
    await fantasy.connect(alice).createEntry(AGGRESSIVE, roster(1));
    await expect(
      fantasy.connect(bob).setRoster(1, 2, roster(20)),
    ).to.be.revertedWithCustomError(fantasy, 'NotEntryOwner');
    await expect(fantasy.connect(alice).setRoster(1, 2, roster(20)))
      .to.emit(fantasy, 'RosterSet')
      .withArgs(1n, 2n);
  });

  it('finalizes by recording claimable prizes, then lets winners pull them', async () => {
    const { fantasy, stable, alice, bob } = await loadFixture(deploy);
    await fantasy.connect(alice).createEntry(AGGRESSIVE, roster(1));
    await fantasy.connect(bob).createEntry(AGGRESSIVE, roster(50));

    const prize = ENTRY_FEE * 2n;
    await expect(fantasy.finalize([1], [prize])).to.emit(fantasy, 'Finalized').withArgs(prize);
    expect(await fantasy.finalized()).to.equal(true);
    expect(await fantasy.claimable(alice.address)).to.equal(prize);

    const before = await stable.balanceOf(alice.address);
    await expect(fantasy.connect(alice).claim())
      .to.emit(fantasy, 'Claimed')
      .withArgs(alice.address, prize);
    expect(await stable.balanceOf(alice.address)).to.equal(before + prize);
    expect(await fantasy.claimable(alice.address)).to.equal(0n);
  });

  it('rejects a payout larger than the pool', async () => {
    const { fantasy, alice } = await loadFixture(deploy);
    await fantasy.connect(alice).createEntry(AGGRESSIVE, roster(1));
    await expect(
      fantasy.finalize([1], [ENTRY_FEE * 5n]),
    ).to.be.revertedWithCustomError(fantasy, 'PrizeExceedsPool');
  });

  it('rejects a claim when there is nothing to withdraw', async () => {
    const { fantasy, alice } = await loadFixture(deploy);
    await expect(fantasy.connect(alice).claim()).to.be.revertedWithCustomError(
      fantasy,
      'NothingToClaim',
    );
  });
});
