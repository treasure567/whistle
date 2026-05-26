// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// @title ManagerLog
/// @notice Open, permissionless log of simulated manager-mode matches. Any
///         wallet can record a match it played; the result is emitted as an
///         event and counted, giving each manager run a verifiable on-chain
///         trail. No tokens, no roles, no off-chain metadata.
contract ManagerLog {
    /// @notice Total matches recorded across all managers.
    uint256 public totalMatches;

    /// @notice Number of matches a given manager has recorded.
    mapping(address => uint256) public matchesOf;

    event ManagerMatchRecorded(
        address indexed manager,
        uint256 indexed matchNumber,
        string nation,
        string opponent,
        uint8 ourScore,
        uint8 theirScore,
        string round,
        bool won,
        uint64 playedAt
    );

    /// @notice Record a played manager-mode match. Callable by anyone.
    /// @return matchNumber Global index of this match (starts at 1).
    function recordMatch(
        string calldata nation,
        string calldata opponent,
        uint8 ourScore,
        uint8 theirScore,
        string calldata round,
        bool won
    ) external returns (uint256 matchNumber) {
        totalMatches += 1;
        matchesOf[msg.sender] += 1;
        matchNumber = totalMatches;
        emit ManagerMatchRecorded(
            msg.sender,
            matchNumber,
            nation,
            opponent,
            ourScore,
            theirScore,
            round,
            won,
            uint64(block.timestamp)
        );
    }
}
