// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

library Errors {
    /* Helpers */
    error ZeroAddress();
    error InvalidAmount();
    error InvalidBaseURI();
    error EmptyNFTData();

    /* OwnershipUpgradeable */
    error NotOwner();
    error NotNominee();
    error OwnerCannotBeNominee();
    error AlreadyNominee();

    /* AequitiNFT */
    error NotAuthorizedToBurnThisToken();
    error TokenIdNotMinted();
}
