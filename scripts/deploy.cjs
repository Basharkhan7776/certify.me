const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying VeriMint to Sepolia...");

  const VeriMint = await ethers.getContractFactory("VeriMint");
  const veriMint = await VeriMint.deploy();

  await veriMint.waitForDeployment();

  const address = await veriMint.getAddress();
  const owner = await veriMint.owner();

  console.log("\n✅ VeriMint deployed successfully!");
  console.log(`   Contract: ${address}`);
  console.log(`   Owner:    ${owner}`);
  console.log(`   Network:  Sepolia (chainId 11155111)`);
  console.log(`\n   Add this to your frontend .env:`);
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
