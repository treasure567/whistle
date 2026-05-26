import { readFileSync, writeFileSync } from 'node:fs';
import { ethers, network } from 'hardhat';

/// Deploys the permissionless ManagerLog contract and records its address in
/// deployments/<network>.json without touching the rest of the stack.
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`deploying ManagerLog to ${network.name} as ${await deployer.getAddress()}`);

  const log = await ethers.deployContract('ManagerLog');
  await log.waitForDeployment();
  const address = await log.getAddress();
  console.log(`ManagerLog: ${address}`);

  const path = `deployments/${network.name}.json`;
  const current = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
  current.ManagerLog = address;
  writeFileSync(path, `${JSON.stringify(current, null, 2)}\n`);
  console.log(`updated ${path}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
