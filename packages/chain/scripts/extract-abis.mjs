import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const artifactsRoot = resolve(here, '../../../../blockchain/artifacts/contracts');
const outDir = resolve(here, '../src/abis');
mkdirSync(outDir, { recursive: true });

const contracts = [
  ['AgentRegistry', 'agentRegistryAbi'],
  ['PositionManager', 'positionManagerAbi'],
  ['MomentNFT', 'momentNftAbi'],
  ['FantasyEntry', 'fantasyEntryAbi'],
  ['SettlementOracle', 'settlementOracleAbi'],
];

const exports = [];
for (const [contract, exportName] of contracts) {
  const artifact = JSON.parse(
    readFileSync(`${artifactsRoot}/${contract}.sol/${contract}.json`, 'utf8'),
  );
  const body = JSON.stringify(artifact.abi, null, 2);
  writeFileSync(`${outDir}/${contract}.ts`, `export const ${exportName} = ${body} as const;\n`);
  exports.push(`export { ${exportName} } from './${contract}.js';`);
}

writeFileSync(`${outDir}/index.ts`, `${exports.join('\n')}\n`);
console.log(`wrote ${contracts.length} ABIs to ${outDir}`);
