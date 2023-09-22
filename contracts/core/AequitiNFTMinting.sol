// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "../helpers/OwnershipUpgradeable.sol";

/**
 * @author DigitalTrustCSP
 * @dev This contract is a minting contract with additional data field with each NFT.
 * @dev The tokenIds are generated and are unique.
 * @dev The URI will be baseURI plus tokenId
 * @dev The NFTs can be minted and burnt only by the Owner.
 */

contract AequitiNFT is ERC721Upgradeable, OwnershipUpgradeable {
    using StringsUpgradeable for uint256;
    using CountersUpgradeable for CountersUpgradeable.Counter;

    /* State Variables */
    string private baseURI_;
    CountersUpgradeable.Counter private tokenId_;

    /* Mappings */
    // tokenId => data
    mapping(uint256 => bytes) private nftDatas;

    /* Public Functions */

    /**
     * @notice initializer for the upgradeable contract
     */
    function initialize(
        string memory name_,
        string memory symbol_,
        string memory baseUri_
    ) public initializer {
        __ERC721_init(name_, symbol_);
        __Ownership_init();
        _setBaseURI(baseUri_);
    }

    /**
     * @notice function for returing the tokenURI.
     * @dev override the ERC721 tokenURI()
     * @dev this will return the token for the given tokenId
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721Upgradeable) returns (string memory) {
        return
            _exists(tokenId)
                ? string(
                    abi.encodePacked(
                        baseURI_,
                        "/",
                        StringsUpgradeable.toString(tokenId)
                    )
                )
                : "";
    }

    /* Public Function Ends */

    /* External Owner Functions */

    /**
     * @notice function for minting nft.
     * @dev only owner can mint nft to the account specified.
     * @dev generate the new tokenId before minting
     * @dev if additional data is not given; revert.
     * @param account address to which nfts has to be minted.
     * @param data additional nft data.
     */
    function mintNft(address account, bytes calldata data) external onlyOwner {
        Helpers._checkAddress(account);

        // data is empty revert
        Helpers._checkData(data);

        // create tokenId
        tokenId_.increment();
        uint256 tokenId = tokenId_.current();

        // save the data
        nftDatas[tokenId] = data;

        // emit events
        emit Events.MintedAequitiNft(account, tokenId, tokenURI(tokenId), data);

        // mint NFT
        _safeMint(account, tokenId, data);
    }

    /**
     * @notice function for burning the nft
     * @dev only owner can call this function
     * @dev nft from owner account will get burnt
     * @param tokenId tokenId of the nft that has to be burnt
     */
    function burnNft(uint256 tokenId) external onlyOwner {
        Helpers._checkAmount(tokenId);

        // check if tokenId exist
        if (!_exists(tokenId)) {
            revert Errors.TokenIdNotMinted();
        }

        // check balance
        if (ownerOf(tokenId) != owner()) {
            revert Errors.NotAuthorizedToBurnThisToken();
        }

        // emit event
        emit Events.BurntAequitiNft(msg.sender, tokenId);

        // remove data
        delete nftDatas[tokenId];

        // burn the tokens
        _burn(tokenId);
    }

    /**
     * @notice function for setting the baseURI for the platform
     * @param baseUri_ baseURI
     */
    function setBaseURI(string memory baseUri_) external onlyOwner {
        // set the uri
        _setBaseURI(baseUri_);
    }

    /**
     * @notice function for returning the nft data
     * @param tokenId tokenId
     * @return nftDatas nftdata in bytes
     */

    function aequitiNFTData(
        uint256 tokenId
    ) external view returns (bytes memory) {
        return nftDatas[tokenId];
    }

    /**
     * @notice function for returning the baseURI
     */
    function baseURI() external view returns (string memory) {
        return baseURI_;
    }

    /* External Function Ends */

    /* Internal helper Function */
    /**
     * @notice function for setting the baseURI
     * @param baseUri_ baseURI
     */
    function _setBaseURI(string memory baseUri_) internal {
        Helpers._checkURI(baseUri_);

        // emit event
        emit Events.BaseURIModified(baseUri_);

        // store urls
        baseURI_ = baseUri_;
    }
}
