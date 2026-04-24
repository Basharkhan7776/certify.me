export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  orgCode: string;
  studentAddr: string;
  tokenId: number;
  date: string;
  uri: string;
  attributes: { trait_type: string; value: string }[];
}

export interface Org {
  id: string;
  name: string;
  orgCode: string;
  walletAddr: string;
  approved: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  walletAddr: string;
}

export interface ApprovalRequest {
  id: string;
  orgName: string;
  email: string;
  walletAddr: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

export const mockCertificates: Certificate[] = [
  {
    id: "cert-1",
    name: "Blockchain Fundamentals",
    issuer: "Tech University",
    orgCode: "0x54454348...",
    studentAddr: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18",
    tokenId: 1,
    date: "2025-03-15",
    uri: "ipfs://QmX7Y8Z9...",
    attributes: [
      { trait_type: "Grade", value: "A" },
      { trait_type: "Duration", value: "12 weeks" },
    ],
  },
  {
    id: "cert-2",
    name: "Smart Contract Development",
    issuer: "Crypto Academy",
    orgCode: "0x43525950...",
    studentAddr: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18",
    tokenId: 2,
    date: "2025-04-01",
    uri: "ipfs://QmA1B2C3...",
    attributes: [
      { trait_type: "Grade", value: "A+" },
      { trait_type: "Duration", value: "8 weeks" },
    ],
  },
  {
    id: "cert-3",
    name: "Web3 Security",
    issuer: "Tech University",
    orgCode: "0x54454348...",
    studentAddr: "0x8Ba1f109551bD432803012645Hac136c22C501e",
    tokenId: 3,
    date: "2025-04-10",
    uri: "ipfs://QmD4E5F6...",
    attributes: [
      { trait_type: "Grade", value: "B+" },
      { trait_type: "Duration", value: "6 weeks" },
    ],
  },
];

export const mockOrgs: Org[] = [
  {
    id: "org-1",
    name: "Tech University",
    orgCode: "0x54454348...",
    walletAddr: "0x1234567890abcdef1234567890abcdef12345678",
    approved: true,
    createdAt: "2025-01-15",
  },
  {
    id: "org-2",
    name: "Crypto Academy",
    orgCode: "0x43525950...",
    walletAddr: "0xabcdef1234567890abcdef1234567890abcdef12",
    approved: true,
    createdAt: "2025-02-20",
  },
];

export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Alice Johnson",
    email: "alice@example.com",
    walletAddr: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18",
  },
  {
    id: "user-2",
    name: "Bob Smith",
    email: "bob@example.com",
    walletAddr: "0x8Ba1f109551bD432803012645Hac136c22C501e",
  },
];

export const mockApprovals: ApprovalRequest[] = [
  {
    id: "req-1",
    orgName: "Digital Learning Hub",
    email: "admin@dlh.edu",
    walletAddr: "0x9999888877776666555544443333222211110000",
    status: "pending",
    submittedAt: "2025-04-20",
  },
  {
    id: "req-2",
    orgName: "Blockchain Institute",
    email: "info@blockchain-inst.org",
    walletAddr: "0x1111222233334444555566667777888899990000",
    status: "pending",
    submittedAt: "2025-04-22",
  },
  {
    id: "req-3",
    orgName: "Web3 School",
    email: "contact@web3school.io",
    walletAddr: "0xaaabbbcccdddeeefff000111222333444555666",
    status: "approved",
    submittedAt: "2025-04-18",
  },
];

export function getCertificateById(id: string): Certificate | undefined {
  return mockCertificates.find((c) => c.id === id);
}

export function getOrgById(id: string): Org | undefined {
  return mockOrgs.find((o) => o.id === id);
}

export function getUserById(id: string): User | undefined {
  return mockUsers.find((u) => u.id === id);
}

export function getOrgCerts(orgId: string): Certificate[] {
  const org = getOrgById(orgId);
  if (!org) return [];
  return mockCertificates.filter((c) => c.orgCode === org.orgCode);
}

export function getUserCerts(userId: string): Certificate[] {
  const user = getUserById(userId);
  if (!user) return [];
  return mockCertificates.filter((c) => c.studentAddr === user.walletAddr);
}
