// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @title MomentNFT
/// @notice Commemorative ERC-721 attestations minted by the Scout agent for
///         culturally significant World Cup moments. Token metadata is
///         pinned to IPFS and referenced per token.
contract MomentNFT is ERC721URIStorage, AccessControl {
    /// @notice Role allowed to mint moments (held by the Scout agent signer).
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    struct Moment {
        uint256 matchId;
        uint64 mintedAt;
    }

    uint256 private _nextTokenId;

    mapping(uint256 => Moment) public moments;

    event MomentMinted(
        uint256 indexed tokenId,
        address indexed to,
        uint256 indexed matchId,
        string uri
    );

    /// @param admin Address granted the admin role at deploy.
    /// @param minter Address granted the minter role (the Scout signer).
    constructor(address admin, address minter) ERC721("Whistle Moment", "WMOMENT") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, minter);
    }

    /// @notice Mint a commemorative moment to a wallet.
    /// @param to Recipient wallet.
    /// @param matchId The match the moment belongs to.
    /// @param uri IPFS metadata URI for the token.
    /// @return tokenId The id of the minted token (starts at 1).
    function mintMoment(address to, uint256 matchId, string calldata uri)
        external
        onlyRole(MINTER_ROLE)
        returns (uint256 tokenId)
    {
        tokenId = ++_nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        moments[tokenId] = Moment({matchId: matchId, mintedAt: uint64(block.timestamp)});
        emit MomentMinted(tokenId, to, matchId, uri);
    }

    /// @notice Total number of moments minted so far.
    function totalMinted() external view returns (uint256) {
        return _nextTokenId;
    }

    /// @inheritdoc ERC721URIStorage
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
