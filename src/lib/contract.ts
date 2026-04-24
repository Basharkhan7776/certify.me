import { createPublicClient, createWalletClient, custom, http } from "viem";
import { sepolia } from "viem/chains";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

const ABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  { inputs: [{ internalType: "bytes32", name: "orgCode", type: "bytes32" }, { internalType: "address", name: "addr", type: "address" }], name: "addOrg", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "bytes32", name: "orgCode", type: "bytes32" }], name: "blockOrg", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "bytes32", name: "orgCode", type: "bytes32" }], name: "unblockOrg", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "bytes32", name: "orgCode", type: "bytes32" }], name: "removeOrg", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "address", name: "student", type: "address" }, { internalType: "string", name: "uri", type: "string" }, { internalType: "bytes32", name: "orgCode", type: "bytes32" }], name: "mint", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "revokeCert", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }, { internalType: "string", name: "newURI", type: "string" }], name: "uriChanger", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "verify", outputs: [{ internalType: "string", name: "uri", type: "string" }, { internalType: "address", name: "student", type: "address" }, { internalType: "bytes32", name: "orgCode", type: "bytes32" }, { internalType: "bool", name: "revoked", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "tokenToURI", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "resolveDetails", outputs: [{ internalType: "address", name: "orgAddr", type: "address" }, { internalType: "address", name: "studentAddr", type: "address" }, { internalType: "bytes32", name: "orgCode", type: "bytes32" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "address", name: "student", type: "address" }], name: "getCertsByStudent", outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "bytes32", name: "orgCode", type: "bytes32" }], name: "getCertsByOrg", outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }], name: "orgs", outputs: [{ internalType: "bytes32", name: "orgCode", type: "bytes32" }, { internalType: "address", name: "addr", type: "address" }, { internalType: "bool", name: "blocked", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }], name: "orgExists", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "", type: "uint256" }], name: "certificates", outputs: [{ internalType: "string", name: "uri", type: "string" }, { internalType: "address", name: "studentAddr", type: "address" }, { internalType: "bytes32", name: "orgCode", type: "bytes32" }, { internalType: "bool", name: "revoked", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "ownerOf", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "owner", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "name", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "symbol", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" },
] as const;

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URL),
});

export function getWalletClient(account: `0x${string}`) {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("No wallet found");
  }
  return createWalletClient({
    chain: sepolia,
    transport: custom((window as any).ethereum),
    account,
  });
}

export async function verifyCertificate(tokenId: number) {
  return publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "verify",
    args: [BigInt(tokenId)],
  });
}

export async function getCertificate(tokenId: number) {
  return publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "certificates",
    args: [BigInt(tokenId)],
  });
}

export async function getCertsByStudent(studentAddr: `0x${string}`) {
  return publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getCertsByStudent",
    args: [studentAddr],
  });
}

export async function getCertsByOrg(orgCode: `0x${string}`) {
  return publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getCertsByOrg",
    args: [orgCode],
  });
}

export async function resolveDetails(tokenId: number) {
  return publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "resolveDetails",
    args: [BigInt(tokenId)],
  });
}

export async function getOrg(orgCode: `0x${string}`) {
  return publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "orgs",
    args: [orgCode],
  });
}

export async function tokenToURI(tokenId: number) {
  return publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "tokenToURI",
    args: [BigInt(tokenId)],
  });
}

export async function mintCertificate(
  account: `0x${string}`,
  student: `0x${string}`,
  uri: string,
  orgCode: `0x${string}`
) {
  const walletClient = getWalletClient(account);
  const { request } = await publicClient.simulateContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "mint",
    args: [student, uri, orgCode],
    account,
  });
  return walletClient.writeContract(request);
}

export async function revokeCertificate(account: `0x${string}`, tokenId: number) {
  const walletClient = getWalletClient(account);
  const { request } = await publicClient.simulateContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "revokeCert",
    args: [BigInt(tokenId)],
    account,
  });
  return walletClient.writeContract(request);
}

export async function addOrgOnChain(account: `0x${string}`, orgCode: `0x${string}`, addr: `0x${string}`) {
  const walletClient = getWalletClient(account);
  const { request } = await publicClient.simulateContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "addOrg",
    args: [orgCode, addr],
    account,
  });
  return walletClient.writeContract(request);
}

export async function blockOrgOnChain(account: `0x${string}`, orgCode: `0x${string}`) {
  const walletClient = getWalletClient(account);
  const { request } = await publicClient.simulateContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "blockOrg",
    args: [orgCode],
    account,
  });
  return walletClient.writeContract(request);
}

export async function unblockOrgOnChain(account: `0x${string}`, orgCode: `0x${string}`) {
  const walletClient = getWalletClient(account);
  const { request } = await publicClient.simulateContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "unblockOrg",
    args: [orgCode],
    account,
  });
  return walletClient.writeContract(request);
}

export async function changeURI(account: `0x${string}`, tokenId: number, newURI: string) {
  const walletClient = getWalletClient(account);
  const { request } = await publicClient.simulateContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "uriChanger",
    args: [BigInt(tokenId), newURI],
    account,
  });
  return walletClient.writeContract(request);
}

export { CONTRACT_ADDRESS, ABI };
