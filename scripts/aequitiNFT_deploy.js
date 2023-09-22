require("@openzeppelin/hardhat-upgrades");

const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const ipfsBaseURI = "ipfs://";
  const httpBaseURL = "https://nftstorage.link/ipfs/";

  console.log(
    `Deploying ChainboxNFT upgradeable contract from the account: ${deployer.address}`
  );

  // copy the baseURI
  const Chainbox = await ethers.getContractFactory("ChainboxNFT");
  const chainbox = await upgrades.deployProxy(
    Chainbox,
    ["ChainboxNFT", "CBXNFT", ipfsBaseURI, httpBaseURL],
    {
      initializer: "initialize",
    }
  );

  await chainbox.deployed();

  console.log(
    `ChainboxNFT upgradeable contract is deployed to the address: ${chainbox.address}`
  );
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
