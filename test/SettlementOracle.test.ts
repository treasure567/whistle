import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture, time } from '@nomicfoundation/hardhat-network-helpers';

const CHALLENGE_WINDOW = 300;

describe('SettlementOracle', () => {
  async function deploy() {
    const [admin, s1, s2, s3, stranger] = await ethers.getSigners();
    const oracle = await ethers.deployContract('SettlementOracle', [
      admin.address,
      [s1.address, s2.address, s3.address],
      CHALLENGE_WINDOW,
    ]);
    return { oracle, admin, s1, s2, s3, stranger };
  }

  it('finalizes after two matching confirmations and the challenge window', async () => {
    const { oracle, s1, s2 } = await loadFixture(deploy);
    const resultHash = ethers.id('ARG 2-1 FRA');

    await expect(oracle.connect(s1).confirmResult(1, resultHash))
      .to.emit(oracle, 'ResultProposed')
      .withArgs(1n, resultHash, s1.address);

    await expect(oracle.connect(s2).confirmResult(1, resultHash))
      .to.emit(oracle, 'ResultFinalized');

    expect(await oracle.isFinal(1)).to.equal(false);
    await time.increase(CHALLENGE_WINDOW + 1);
    expect(await oracle.isFinal(1)).to.equal(true);

    const [hash, finalConfirmed] = await oracle.getResult(1);
    expect(hash).to.equal(resultHash);
    expect(finalConfirmed).to.equal(true);
  });

  it('rejects a mismatched second confirmation', async () => {
    const { oracle, s1, s2 } = await loadFixture(deploy);
    await oracle.connect(s1).confirmResult(1, ethers.id('a'));
    await expect(
      oracle.connect(s2).confirmResult(1, ethers.id('b')),
    ).to.be.revertedWithCustomError(oracle, 'ResultMismatch');
  });

  it('rejects double confirmation by the same signer', async () => {
    const { oracle, s1 } = await loadFixture(deploy);
    const hash = ethers.id('a');
    await oracle.connect(s1).confirmResult(1, hash);
    await expect(oracle.connect(s1).confirmResult(1, hash)).to.be.revertedWithCustomError(
      oracle,
      'AlreadyConfirmed',
    );
  });

  it('rejects confirmation from a non-signer', async () => {
    const { oracle, stranger } = await loadFixture(deploy);
    await expect(
      oracle.connect(stranger).confirmResult(1, ethers.id('a')),
    ).to.be.revertedWithCustomError(oracle, 'AccessControlUnauthorizedAccount');
  });
});
