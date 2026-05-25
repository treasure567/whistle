// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @title SettlementOracle
/// @notice Posts match results under a 2-of-3 multisig. A result becomes
///         final only after a challenge window elapses, giving signers time
///         to dispute a bad post before downstream settlement relies on it.
/// @dev Signers each confirm a result hash for a match. The first confirm
///      proposes the hash; later confirms must match it. On reaching the
///      threshold the challenge window starts.
contract SettlementOracle is AccessControl {
    /// @notice Role held by each of the three result signers.
    bytes32 public constant SIGNER_ROLE = keccak256("SIGNER_ROLE");

    /// @notice Confirmations required to finalize a result.
    uint8 public constant THRESHOLD = 2;

    struct Result {
        bytes32 resultHash;
        uint8 confirmations;
        uint64 finalizedAt;
        bool exists;
    }

    /// @notice Seconds after the threshold is reached before a result is final.
    uint64 public immutable challengeWindow;

    mapping(uint256 => Result) private _results;
    mapping(uint256 => mapping(address => bool)) private _confirmed;

    event ResultProposed(uint256 indexed matchId, bytes32 resultHash, address indexed signer);
    event ResultConfirmed(uint256 indexed matchId, address indexed signer, uint8 confirmations);
    event ResultFinalized(uint256 indexed matchId, bytes32 resultHash, uint64 finalizedAt);

    error ResultMismatch();
    error AlreadyConfirmed();
    error NoResult();

    /// @param admin Address granted the admin role at deploy.
    /// @param signers The result signer set (expected length three).
    /// @param challengeWindow_ Challenge window in seconds.
    constructor(address admin, address[] memory signers, uint64 challengeWindow_) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        for (uint256 i = 0; i < signers.length; i++) {
            _grantRole(SIGNER_ROLE, signers[i]);
        }
        challengeWindow = challengeWindow_;
    }

    /// @notice Confirm a result hash for a match. The first confirmation
    ///         proposes the hash; subsequent confirmations must match it.
    function confirmResult(uint256 matchId, bytes32 resultHash) external onlyRole(SIGNER_ROLE) {
        if (_confirmed[matchId][msg.sender]) revert AlreadyConfirmed();
        Result storage result = _results[matchId];

        if (!result.exists) {
            result.resultHash = resultHash;
            result.exists = true;
            emit ResultProposed(matchId, resultHash, msg.sender);
        } else if (result.resultHash != resultHash) {
            revert ResultMismatch();
        }

        _confirmed[matchId][msg.sender] = true;
        result.confirmations += 1;
        emit ResultConfirmed(matchId, msg.sender, result.confirmations);

        if (result.confirmations == THRESHOLD && result.finalizedAt == 0) {
            result.finalizedAt = uint64(block.timestamp) + challengeWindow;
            emit ResultFinalized(matchId, result.resultHash, result.finalizedAt);
        }
    }

    /// @notice Whether a match result has passed its challenge window.
    function isFinal(uint256 matchId) public view returns (bool) {
        Result storage result = _results[matchId];
        return result.finalizedAt != 0 && block.timestamp >= result.finalizedAt;
    }

    /// @notice Read a posted result and whether it is final.
    function getResult(uint256 matchId)
        external
        view
        returns (bytes32 resultHash, bool finalConfirmed)
    {
        Result storage result = _results[matchId];
        if (!result.exists) revert NoResult();
        return (result.resultHash, isFinal(matchId));
    }
}
