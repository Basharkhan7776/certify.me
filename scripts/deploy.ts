import { ethers } from "hardhat";

async function main() {
  const VeriMint = await ethers.getContractFactory("VeriMint");
  const veriMint = await VeriMint.deploy();

  await veriMint.waitForDeployment();

  const address = await veriMint.getAddress();
  console.log(`VeriMint deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
