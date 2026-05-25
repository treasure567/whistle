// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title FantasyEntry
/// @notice Per-tournament fantasy roster registry for the Manager agent.
///         Entrants pay a stablecoin entry fee into a prize pool and submit
///         an eleven-player roster, updated per matchday.
/// @dev Licensing-clean by construction: a player is identified only by a
///      nation code and a jersey number, never a real name or likeness.
///      Prizes use a pull-payment model: finalize records each winner's
///      claimable amount and winners withdraw with claim. This avoids an
///      unbounded transfer loop and stops one failing recipient from
///      blocking the whole payout.
contract FantasyEntry is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Role allowed to finalize the tournament and award prizes.
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    /// @notice Fixed roster size.
    uint256 public constant ROSTER_SIZE = 11;

    enum Profile {
        Aggressive,
        Defensive,
        Contrarian
    }

    struct Player {
        bytes3 nation;
        uint8 jersey;
    }

    struct Entry {
        address owner;
        Profile profile;
        bool active;
        uint64 createdAt;
    }

    IERC20 public immutable stable;
    uint256 public immutable entryFee;

    bool public finalized;
    uint256 public entryCount;
    uint256 public prizePool;

    mapping(uint256 => Entry) private _entries;
    mapping(uint256 => Player[ROSTER_SIZE]) private _rosters;
    mapping(address => uint256) public claimable;

    event EntryCreated(uint256 indexed entryId, address indexed owner, Profile profile);
    event RosterSet(uint256 indexed entryId, uint64 matchday);
    event Finalized(uint256 totalAwarded);
    event Claimed(address indexed owner, uint256 amount);

    error AlreadyFinalized();
    error InvalidRoster();
    error NotEntryOwner();
    error LengthMismatch();
    error PrizeExceedsPool();
    error UnknownEntry();
    error NothingToClaim();

    constructor(address admin, IERC20 stable_, uint256 entryFee_) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MANAGER_ROLE, admin);
        stable = stable_;
        entryFee = entryFee_;
    }

    /// @notice Pay the entry fee and register an eleven-player roster.
    /// @return entryId The id of the new entry (starts at 1).
    function createEntry(Profile profile, Player[] calldata roster)
        external
        nonReentrant
        returns (uint256 entryId)
    {
        if (finalized) revert AlreadyFinalized();
        if (roster.length != ROSTER_SIZE) revert InvalidRoster();

        stable.safeTransferFrom(msg.sender, address(this), entryFee);
        prizePool += entryFee;

        entryId = ++entryCount;
        _entries[entryId] = Entry({
            owner: msg.sender,
            profile: profile,
            active: true,
            createdAt: uint64(block.timestamp)
        });
        _writeRoster(entryId, roster);

        emit EntryCreated(entryId, msg.sender, profile);
        emit RosterSet(entryId, 0);
    }

    /// @notice Replace an entry's roster for a given matchday.
    function setRoster(uint256 entryId, uint64 matchday, Player[] calldata roster) external {
        if (finalized) revert AlreadyFinalized();
        if (_entries[entryId].owner != msg.sender) revert NotEntryOwner();
        if (roster.length != ROSTER_SIZE) revert InvalidRoster();
        _writeRoster(entryId, roster);
        emit RosterSet(entryId, matchday);
    }

    /// @notice Finalize the tournament and record each winner's claimable prize.
    /// @dev Records balances only, no transfers. Winners withdraw via claim.
    function finalize(uint256[] calldata winners, uint256[] calldata amounts)
        external
        onlyRole(MANAGER_ROLE)
    {
        if (finalized) revert AlreadyFinalized();
        if (winners.length != amounts.length) revert LengthMismatch();

        uint256 total;
        for (uint256 i = 0; i < amounts.length; i++) {
            total += amounts[i];
        }
        if (total > prizePool) revert PrizeExceedsPool();

        finalized = true;
        for (uint256 i = 0; i < winners.length; i++) {
            address owner = _entries[winners[i]].owner;
            if (owner == address(0)) revert UnknownEntry();
            claimable[owner] += amounts[i];
        }
        emit Finalized(total);
    }

    /// @notice Withdraw the prize awarded to the caller.
    function claim() external nonReentrant {
        uint256 amount = claimable[msg.sender];
        if (amount == 0) revert NothingToClaim();
        claimable[msg.sender] = 0;
        stable.safeTransfer(msg.sender, amount);
        emit Claimed(msg.sender, amount);
    }

    /// @notice Read an entry record.
    function getEntry(uint256 entryId) external view returns (Entry memory) {
        return _entries[entryId];
    }

    /// @notice Read an entry's current roster.
    function getRoster(uint256 entryId) external view returns (Player[ROSTER_SIZE] memory) {
        return _rosters[entryId];
    }

    function _writeRoster(uint256 entryId, Player[] calldata roster) private {
        for (uint256 i = 0; i < ROSTER_SIZE; i++) {
            _rosters[entryId][i] = roster[i];
        }
    }
}
