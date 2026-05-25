// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @title AgentRegistry
/// @notice Onchain registry of the three whistle agents (Scout, Bookie,
///         Manager): their kind, display name, strategy hash, and owner.
/// @dev The strategy hash commits to the offchain strategy template and
///      system prompt so an agent's decision logic is auditable over time.
contract AgentRegistry is AccessControl {
    /// @notice Role allowed to register agents and mutate their records.
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    enum AgentKind {
        Scout,
        Bookie,
        Manager
    }

    struct Agent {
        AgentKind kind;
        string name;
        bytes32 strategyHash;
        address owner;
        bool active;
        uint64 registeredAt;
    }

    /// @notice Total number of agents registered. Also the latest agent id.
    uint256 public agentCount;

    mapping(uint256 => Agent) private _agents;

    event AgentRegistered(
        uint256 indexed agentId,
        AgentKind kind,
        address indexed owner,
        bytes32 strategyHash
    );
    event StrategyUpdated(uint256 indexed agentId, bytes32 strategyHash);
    event AgentStatusChanged(uint256 indexed agentId, bool active);

    error AgentNotFound(uint256 agentId);

    /// @param admin Address granted admin and registrar roles at deploy.
    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REGISTRAR_ROLE, admin);
    }

    /// @notice Register a new agent.
    /// @return agentId The id assigned to the new agent (starts at 1).
    function registerAgent(
        AgentKind kind,
        string calldata name,
        bytes32 strategyHash,
        address owner
    ) external onlyRole(REGISTRAR_ROLE) returns (uint256 agentId) {
        agentId = ++agentCount;
        _agents[agentId] = Agent({
            kind: kind,
            name: name,
            strategyHash: strategyHash,
            owner: owner,
            active: true,
            registeredAt: uint64(block.timestamp)
        });
        emit AgentRegistered(agentId, kind, owner, strategyHash);
    }

    /// @notice Update the committed strategy hash for an agent.
    function updateStrategy(uint256 agentId, bytes32 strategyHash)
        external
        onlyRole(REGISTRAR_ROLE)
    {
        _requireExists(agentId);
        _agents[agentId].strategyHash = strategyHash;
        emit StrategyUpdated(agentId, strategyHash);
    }

    /// @notice Activate or deactivate an agent.
    function setActive(uint256 agentId, bool active) external onlyRole(REGISTRAR_ROLE) {
        _requireExists(agentId);
        _agents[agentId].active = active;
        emit AgentStatusChanged(agentId, active);
    }

    /// @notice Read an agent record.
    function getAgent(uint256 agentId) external view returns (Agent memory) {
        _requireExists(agentId);
        return _agents[agentId];
    }

    function _requireExists(uint256 agentId) private view {
        if (agentId == 0 || agentId > agentCount) revert AgentNotFound(agentId);
    }
}
