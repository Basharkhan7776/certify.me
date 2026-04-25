import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { CONTRACT_ADDRESS, ABI } from "@/lib/contract";

const RPC_URL = process.env.RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

const account = privateKeyToAccount(process.env.PVT_KEY as `0x${string}`);

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URL),
});

const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(RPC_URL),
});

export async function checkOrgExists(orgCode: `0x${string}`): Promise<boolean> {
  try {
    const result = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: "orgs",
      args: [orgCode],
    });
    return (result as any)[1] !== "0x0000000000000000000000000000000000000000";
  } catch {
    return false;
  }
}

export async function getOrgOnChain(orgCode: `0x${string}`) {
  return publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "orgs",
    args: [orgCode],
  });
}

export async function addOrgOnChain(orgCode: `0x${string}`, addr: `0x${string}`) {
  const { request } = await publicClient.simulateContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "addOrg",
    args: [orgCode, addr],
    account,
  });
  const hash = await walletClient.writeContract(request);
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

export async function blockOrgOnChain(orgCode: `0x${string}`) {
  const { request } = await publicClient.simulateContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "blockOrg",
    args: [orgCode],
    account,
  });
  const hash = await walletClient.writeContract(request);
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

export async function unblockOrgOnChain(orgCode: `0x${string}`) {
  const { request } = await publicClient.simulateContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "unblockOrg",
    args: [orgCode],
    account,
  });
  const hash = await walletClient.writeContract(request);
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

export { CONTRACT_ADDRESS };
