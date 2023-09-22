const { upgrades, ethers } = require("hardhat");
const { expect } = require("chai");
const { constants } = require("@openzeppelin/test-helpers");
const expectEvent = require("@openzeppelin/test-helpers/src/expectEvent");

describe("AequitiNFTMinting", () => {
  let admin, add1, add2, AequitiNFT, aequitiNFT;

  beforeEach(async () => {
    // initialize the signers
    [admin, add1, add2] = await ethers.getSigners();
    baseURL =
      "https://nftstorage.link/ipfs/bafybeidwdnguqnc7djgazxdrzl7tzw2x6xui4kx7b27h3rio4lyzmxvutu";

    // deploy the contract using proxy
    AequitiNFT = await ethers.getContractFactory("AequitiNFT");
    aequitiNFT = await upgrades.deployProxy(
      AequitiNFT,
      ["AequitiNFT", "AQTNFT", baseURL],
      {
        initializer: "initialize",
      }
    );
    await aequitiNFT.deployed();
  });

  describe("Initialize", () => {
    it("Should set the right owner", async () => {
      expect(await aequitiNFT.owner()).to.equal(admin.address);
    });

    it("Should set the name", async () => {
      expect(await aequitiNFT.name()).to.equal("AequitiNFT");
    });

    it("Should set the symbol", async () => {
      expect(await aequitiNFT.symbol()).to.equal("AQTNFT");
    });

    it("Should set the baseURL", async () => {
      expect(await aequitiNFT.baseURI()).to.equal(baseURL);
    });
  });

  describe("Add Nominee", () => {
    it("Should revert if the txn is not by the owner", async () => {
      await expect(
        aequitiNFT.connect(add2).addNominee(add1.address)
      ).to.be.revertedWith("NotOwner");
    });

    it("Should revert if the nominee is same as the owner", async () => {
      await expect(
        aequitiNFT.connect(admin).addNominee(admin.address)
      ).to.be.revertedWith("OwnerCannotBeNominee");
    });

    it("Should revert if the nominee is same as before", async () => {
      await aequitiNFT.connect(admin).addNominee(add1.address);

      await expect(
        aequitiNFT.connect(admin).addNominee(add1.address)
      ).to.be.revertedWith("AlreadyNominee");
    });

    it("Should add nominee by the owner", async () => {
      let result = await aequitiNFT.connect(admin).addNominee(add1.address);

      expectEvent.inTransaction(result.tx, aequitiNFT, "NomineeAdded", {
        owner: admin.address,
        nominee: add1.address,
      });
      expect(await aequitiNFT.nominee()).to.equal(add1.address);
    });
  });

  describe("Accept Nomination", () => {
    it("Should revert if the caller is not nominee", async () => {
      await aequitiNFT.connect(admin).addNominee(add1.address);
      await expect(
        aequitiNFT.connect(add2).acceptNomination()
      ).to.be.revertedWith("NotNominee");
    });

    it("Should change the owner upon accepting nomination by the nominee", async () => {
      await aequitiNFT.connect(admin).addNominee(add1.address);
      let result = await aequitiNFT.connect(add1).acceptNomination();

      expectEvent.inTransaction(result.tx, aequitiNFT, "OwnerChanged", {
        newOwner: add1.address,
      });
      expect(await aequitiNFT.owner()).to.equal(add1.address);
      expect(await aequitiNFT.nominee()).to.equal(constants.ZERO_ADDRESS);
    });
  });

  describe("Mint NFT", () => {
    it("Should revert if the txn is not by the owner", async () => {
      // encode data
      let price = 10;
      let data = ethers.utils.AbiCoder.prototype.encode(["uint256"], [price]);

      // mint nft
      await expect(
        aequitiNFT.connect(add1).mintNft(add1.address, data)
      ).to.be.revertedWith("NotOwner");
    });

    it("Should revert if the account is a zero address", async () => {
      // encode data
      let price = 10;
      let data = ethers.utils.AbiCoder.prototype.encode(["uint256"], [price]);

      // mint nft
      await expect(
        aequitiNFT.connect(admin).mintNft(constants.ZERO_ADDRESS, data)
      ).to.be.revertedWith("ZeroAddress");
    });

    it("Should revert if the data is empty", async () => {
      // encode data
      let price = 10;
      let data = ethers.utils.AbiCoder.prototype.encode([], []);

      // mint nft
      await expect(
        aequitiNFT.connect(admin).mintNft(add1.address, data)
      ).to.be.revertedWith("EmptyNFTData");
    });

    it("Should mint the NFT properly and set the details properly", async () => {
      tokenId = 1;

      // encode data
      let price = 10;
      let data = ethers.utils.AbiCoder.prototype.encode(["uint256"], [price]);

      // mint nft
      let result = await aequitiNFT.connect(admin).mintNft(add1.address, data);

      // process data
      let tokenUriCreated = await aequitiNFT.tokenURI(1);
      let nftData = await aequitiNFT.aequitiNFTData(tokenId);

      let tokenURI = baseURL + "/" + 1;

      expectEvent.inTransaction(result.tx, aequitiNFT, "MintedAequitiNft", {
        account: add1.address,
        tokenId: 1,
        tokenURI: tokenURI,
        data: data,
      });

      expect(tokenUriCreated).to.equal(tokenURI);
      expect(nftData).to.equal(data);
      expect(await aequitiNFT.balanceOf(add1.address)).to.equal(1);
    });
  });

  describe("Burn NFT", () => {
    it("Should revert if the txn is not by the owner", async () => {
      tokenId = 1;

      // encode data
      let price = 10;
      let data = ethers.utils.AbiCoder.prototype.encode(["uint256"], [price]);

      // mint nft
      await aequitiNFT.connect(admin).mintNft(add1.address, data);

      // burn token
      await expect(aequitiNFT.connect(add1).burnNft(tokenId)).to.revertedWith(
        "NotOwner"
      );
    });

    it("Should revert if the tokenId is zero", async () => {
      // encode data
      let price = 10;
      let data = ethers.utils.AbiCoder.prototype.encode(["uint256"], [price]);

      // mint nft
      await aequitiNFT.connect(admin).mintNft(admin.address, data);

      // burn nft
      tokenId = 0;
      await expect(
        aequitiNFT.connect(admin).burnNft(tokenId)
      ).to.be.revertedWith("InvalidAmount");
    });

    it("Should revert if the tokenId does not exist (not minted)", async () => {
      // encode data
      let price = 10;
      let data = ethers.utils.AbiCoder.prototype.encode(["uint256"], [price]);

      // mint nft
      await aequitiNFT.connect(admin).mintNft(admin.address, data);

      // burn nft
      tokenId = 2;
      await expect(
        aequitiNFT.connect(admin).burnNft(tokenId)
      ).to.be.revertedWith("TokenIdNotMinted");
    });

    it("Should revert if the NFT is not with the admin", async () => {
      let tokenId = 1;

      // encode data
      let price = 10;
      let data = ethers.utils.AbiCoder.prototype.encode(["uint256"], [price]);

      // mint nft
      await aequitiNFT.connect(admin).mintNft(add1.address, data);

      // burn nft
      await expect(
        aequitiNFT.connect(admin).burnNft(tokenId)
      ).to.be.revertedWith("NotAuthorizedToBurnThisToken");
    });

    it("Should burn the nft properly", async () => {
      let tokenId = 1;

      // encode data
      let price = 10;
      let data = ethers.utils.AbiCoder.prototype.encode(["uint256"], [price]);

      // mint nft
      await aequitiNFT.connect(admin).mintNft(add1.address, data);

      // transfer nft to the owner
      await aequitiNFT.connect(add1).approve(admin.address, tokenId);
      await aequitiNFT
        .connect(admin)
        .transferFrom(add1.address, admin.address, tokenId);

      // burn nft
      let result = await aequitiNFT.connect(admin).burnNft(tokenId);
      expectEvent.inTransaction(result.tx, aequitiNFT, "BurntAequitiNFT", {
        account: admin.address,
        tokenId: 1,
      });

      expect(await aequitiNFT.balanceOf(admin.address)).to.equal(0);

      // retrieve data
      let nftData = await aequitiNFT.aequitiNFTData(tokenId);
      expect(nftData).to.equal("0x");
      expect(await aequitiNFT.tokenURI(tokenId)).to.equal("");
    });
  });

  describe("TokenURI", () => {
    it("Should return null if tokenId does not exist", async () => {
      let uri_ = await aequitiNFT.tokenURI(1);
      expect(uri_).to.equal("");
    });
  });
});
