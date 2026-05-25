import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('MomentNFT', () => {
  async function deploy() {
    const [admin, minter, fan, stranger] = await ethers.getSigners();
    const nft = await ethers.deployContract('MomentNFT', [admin.address, minter.address]);
    return { nft, admin, minter, fan, stranger };
  }

  it('mints a moment with IPFS metadata', async () => {
    const { nft, minter, fan } = await loadFixture(deploy);
    const uri = 'ipfs://bafyMoment1';

    await expect(nft.connect(minter).mintMoment(fan.address, 42, uri))
      .to.emit(nft, 'MomentMinted')
      .withArgs(1n, fan.address, 42n, uri);

    expect(await nft.ownerOf(1)).to.equal(fan.address);
    expect(await nft.tokenURI(1)).to.equal(uri);
    expect(await nft.totalMinted()).to.equal(1n);
    expect((await nft.moments(1)).matchId).to.equal(42n);
  });

  it('rejects mint from a non-minter', async () => {
    const { nft, stranger, fan } = await loadFixture(deploy);
    await expect(
      nft.connect(stranger).mintMoment(fan.address, 1, 'ipfs://x'),
    ).to.be.revertedWithCustomError(nft, 'AccessControlUnauthorizedAccount');
  });

  it('supports the ERC721 interface', async () => {
    const { nft } = await loadFixture(deploy);
    expect(await nft.supportsInterface('0x80ac58cd')).to.equal(true);
  });
});
