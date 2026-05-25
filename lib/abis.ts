import { parseAbi } from "viem";

export const ERC20_ABI = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function mint(address to, uint256 amount)",
]);

export const POSITION_MANAGER_ABI = parseAbi([
  "function allocate(uint256 agentId, uint256 amount)",
  "function withdraw(uint256 agentId, uint256 amount)",
  "function allocations(address user, uint256 agentId) view returns (uint256)",
  "function matchStaked(uint256 agentId, uint256 matchId) view returns (uint256)",
  "function perMatchCeiling() view returns (uint256)",
  "event CapitalAllocated(address indexed user, uint256 indexed agentId, uint256 amount)",
]);

export const AGENT_REGISTRY_ABI = parseAbi([
  "function agentCount() view returns (uint256)",
  "function getAgent(uint256 agentId) view returns ((uint8 kind, string name, bytes32 strategyHash, address owner, bool active, uint64 registeredAt))",
]);
