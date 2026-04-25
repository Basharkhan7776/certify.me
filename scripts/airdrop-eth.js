const { ethers } = require("ethers");
require("dotenv").config();

const RECIPIENTS = [
  "0x44eE912703AC80B9Ed6469eb49403D4D7261cb66",
];

const AMOUNT_ETH = "0.01";

const RPC_URL = process.env.RPC_URL || "https://sepolia.drpc.org";
const PRIVATE_KEY = process.env.PVT_KEY;

if (!PRIVATE_KEY) {
  console.error("Error: PVT_KEY not set in .env");
  process.exit(1);
}

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log(`Sender: ${wallet.address}`);
  const balance = await provider.getBalance(wallet.address);
  console.log(`Sender balance: ${ethers.formatEther(balance)} ETH`);

  const amount = ethers.parseEther(AMOUNT_ETH);
  const totalNeeded = amount * BigInt(RECIPIENTS.length);

  if (balance < totalNeeded) {
    console.error(`Insufficient balance. Need ${ethers.formatEther(totalNeeded)} ETH, have ${ethers.formatEther(balance)} ETH`);
    process.exit(1);
  }

  console.log(`\nAirdropping ${AMOUNT_ETH} ETH to ${RECIPIENTS.length} address(es)...\n`);

  for (const recipient of RECIPIENTS) {
    try {
      const tx = await wallet.sendTransaction({
        to: recipient,
        value: amount,
      });

      console.log(`→ ${recipient}`);
      console.log(`  TX: https://sepolia.etherscan.io/tx/${tx.hash}`);

      const receipt = await tx.wait();
      console.log(`  Confirmed (block ${receipt.blockNumber})\n`);
    } catch (err) {
      console.error(`✗ Failed to send to ${recipient}: ${err.message}\n`);
    }
  }

  const finalBalance = await provider.getBalance(wallet.address);
  console.log(`Done. Remaining balance: ${ethers.formatEther(finalBalance)} ETH`);
}

main().catch(console.error);
