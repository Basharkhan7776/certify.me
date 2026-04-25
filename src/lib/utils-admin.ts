export function stringToBytes32(str: string): `0x${string}` {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const padded = new Uint8Array(32);
  padded.set(bytes);
  let hex = "0x";
  for (const b of padded) {
    hex += b.toString(16).padStart(2, "0");
  }
  return hex as `0x${string}`;
}

export function bytes32ToString(bytes32: `0x${string}`): string {
  const hex = bytes32.slice(2);
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  const decoder = new TextDecoder();
  return decoder.decode(bytes).replace(/\0/g, "").trim();
}

export function shortAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function isValidAddress(addr: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}
