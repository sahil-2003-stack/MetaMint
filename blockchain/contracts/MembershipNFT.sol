// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MembershipNFT is AccessControl, ERC721URIStorage {
    uint256 public tokenCounter;
    mapping(uint256 => string) public tokenTier;

    constructor() ERC721("MembershipNFT", "MEMB") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        tokenCounter = 0;
    }

    /// @notice Public mint function for membership NFT with a tier.
    /// @param tier The membership tier (e.g., "bronze", "silver", "gold").
    /// @return The new token's ID.
    function mintMembership(string memory tier) public returns (uint256) {
        uint256 newItemId = tokenCounter;
        _safeMint(msg.sender, newItemId);
        tokenTier[newItemId] = tier;
        tokenCounter++;
        return newItemId;
    }

    // Override supportsInterface to resolve inheritance conflict
    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControl, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    bool public mintingActive = true;

    /// @notice Returns whether minting is currently active.
    function getMintStatus() public view returns (bool) {
        return mintingActive;
    }
}





