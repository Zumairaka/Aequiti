require("@openzeppelin/hardhat-upgrades");

const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const baseURL =
    "https://nftstorage.link/ipfs/bafybeidwdnguqnc7djgazxdrzl7tzw2x6xui4kx7b27h3rio4lyzmxvutu";

  console.log(
    `Deploying Aequiti upgradeable contract from the account: ${deployer.address}`
  );

  // copy the baseURI
  const Aequiti = await ethers.getContractFactory("AequitiNFT");
  const aequiti = await upgrades.deployProxy(
    Aequiti,
    ["AequitiNFT", "AQTNFT", baseURL],
    {
      initializer: "initialize",
    }
  );

  await aequiti.deployed();

  console.log(
    `Aequiti upgradeable contract is deployed to the address: ${aequiti.address}`
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
