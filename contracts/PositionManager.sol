// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AgentRegistry} from "./AgentRegistry.sol";

/// @title PositionManager
/// @notice Custodies user capital allocated to an agent and records the
///         positions the agent opens and settles per match. Capital deployed
///         per match is bounded by a configurable ceiling.
/// @dev Users allocate a stablecoin to an agent. The agent signer (holding
///      AGENT_ROLE via a session key) opens positions against a user's
///      allocation and settles them. Settlement credits flow back to the
///      user's allocation; payout liquidity above staked principal must be
///      pre-funded into this contract.
contract PositionManager is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Role held by an agent's session-key signer.
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");

    enum PositionStatus {
        Open,
        Won,
        Lost
    }

    struct Position {
        address user;
        uint256 agentId;
        uint256 matchId;
        uint256 stake;
        uint256 payout;
        PositionStatus status;
        uint64 openedAt;
    }

    IERC20 public immutable stable;
    AgentRegistry public immutable registry;

    /// @notice Maximum cumulative stake an agent may deploy per match. Zero
    ///         disables the ceiling.
    uint256 public perMatchCeiling;

    mapping(address => mapping(uint256 => uint256)) public allocations;
    mapping(uint256 => mapping(uint256 => uint256)) public matchStaked;

    uint256 public positionCount;
    mapping(uint256 => Position) private _positions;

    event CapitalAllocated(address indexed user, uint256 indexed agentId, uint256 amount);
    event CapitalWithdrawn(address indexed user, uint256 indexed agentId, uint256 amount);
    event PositionOpened(
        uint256 indexed positionId,
        uint256 indexed agentId,
        address indexed user,
        uint256 matchId,
        uint256 stake
    );
    event PositionSettled(uint256 indexed positionId, PositionStatus status, uint256 payout);
    event PerMatchCeilingUpdated(uint256 ceiling);

    error ZeroAmount();
    error InsufficientAllocation();
    error CeilingExceeded();
    error InactiveAgent();
    error PositionNotOpen();

    constructor(
        address admin,
        IERC20 stable_,
        AgentRegistry registry_,
        uint256 perMatchCeiling_
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        stable = stable_;
        registry = registry_;
        perMatchCeiling = perMatchCeiling_;
    }

    /// @notice Set the per-match stake ceiling. Zero disables it.
    function setPerMatchCeiling(uint256 ceiling) external onlyRole(DEFAULT_ADMIN_ROLE) {
        perMatchCeiling = ceiling;
        emit PerMatchCeilingUpdated(ceiling);
    }

    /// @notice Allocate stablecoin capital to an agent. Requires prior approval.
    function allocate(uint256 agentId, uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (!registry.getAgent(agentId).active) revert InactiveAgent();
        stable.safeTransferFrom(msg.sender, address(this), amount);
        allocations[msg.sender][agentId] += amount;
        emit CapitalAllocated(msg.sender, agentId, amount);
    }

    /// @notice Withdraw unspent allocation from an agent.
    function withdraw(uint256 agentId, uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        uint256 balance = allocations[msg.sender][agentId];
        if (amount > balance) revert InsufficientAllocation();
        allocations[msg.sender][agentId] = balance - amount;
        stable.safeTransfer(msg.sender, amount);
        emit CapitalWithdrawn(msg.sender, agentId, amount);
    }

    /// @notice Open a position for a user, drawing from their allocation.
    /// @return positionId The id of the opened position (starts at 1).
    function openPosition(address user, uint256 agentId, uint256 matchId, uint256 stake)
        external
        onlyRole(AGENT_ROLE)
        returns (uint256 positionId)
    {
        if (stake == 0) revert ZeroAmount();
        if (allocations[user][agentId] < stake) revert InsufficientAllocation();

        uint256 staked = matchStaked[agentId][matchId] + stake;
        if (perMatchCeiling != 0 && staked > perMatchCeiling) revert CeilingExceeded();

        allocations[user][agentId] -= stake;
        matchStaked[agentId][matchId] = staked;

        positionId = ++positionCount;
        _positions[positionId] = Position({
            user: user,
            agentId: agentId,
            matchId: matchId,
            stake: stake,
            payout: 0,
            status: PositionStatus.Open,
            openedAt: uint64(block.timestamp)
        });
        emit PositionOpened(positionId, agentId, user, matchId, stake);
    }

    /// @notice Settle an open position. On a win, payout is credited to the
    ///         user's allocation.
    /// @param payout Total amount returned to the user on a win (stake plus profit).
    function settlePosition(uint256 positionId, bool won, uint256 payout)
        external
        onlyRole(AGENT_ROLE)
        nonReentrant
    {
        Position storage position = _positions[positionId];
        if (position.status != PositionStatus.Open) revert PositionNotOpen();

        if (won) {
            position.status = PositionStatus.Won;
            position.payout = payout;
            allocations[position.user][position.agentId] += payout;
        } else {
            position.status = PositionStatus.Lost;
        }
        emit PositionSettled(positionId, position.status, position.payout);
    }

    /// @notice Read a position record.
    function getPosition(uint256 positionId) external view returns (Position memory) {
        return _positions[positionId];
    }
}
