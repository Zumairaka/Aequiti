// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

library Events {
    /* OwnershipUpgradeable Events */
    /**
     * @notice emitted when the nominee is added
     * @param owner admin address
     * @param nominee nominee address
     */
    event NomineeAdded(address indexed owner, address indexed nominee);

    /**
     * @notice emitted when the owner is modified
     * @param newOwner new admin address
     */
    event OwnerChanged(address indexed newOwner);

    /* Aequiti Events */
    /**
     * @notice emitted when baseURI is modified
     * @param baseURI new uri
     */
    event BaseURIModified(string indexed baseURI);

    /**
     * @notice emitted when the NFT is minted
     * @param account account address to which NFT is minted
     * @param tokenId tokenId of NFT minted
     * @param tokenURI tokenURI of NFT minted
     * @param data data of NFT minted
     */
    event MintedAequitiNft(
        address indexed account,
        uint256 indexed tokenId,
        string indexed tokenURI,
        bytes data
    );

    /**
     * @notice emitted when the NFT is burnt
     * @param account account address from which NFT is burnt
     * @param tokenId tokenId of NFT
     */
    event BurntAequitiNft(address indexed account, uint256 indexed tokenId);
}
